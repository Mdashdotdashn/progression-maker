const Tonal = require('tonal');

// returns an array of intervals by applying a scale and alterations

buildScaleIntervals = function(scaleName, alterations)
{
  // gets the scale intervals
  var intervals = Tonal.Scale.intervals(scaleName);

  // apply alterations
  if (alterations && alterations.length > 0)
  {
    for (var a of alterations)
    {
      var degree = Math.abs(a);
      var offset = Math.sign(a) > 0 ? "2m" : "-2m";

      if (degree <= intervals.length)
      {
        intervals[degree-1] = Tonal.transpose(intervals[degree-1], offset);
      }
    }
  }
  return intervals;
}

computeScaleScore = function(scaleName, intervalsToMatch, offset)
{
  // Get tonal intervals
  var scaleIntervals = Tonal.Scale.intervals(scaleName);
  var intervals = [0,0,0,0,0,0,0,0,0,0,0,0];
  var currentIndex = offset;
  intervals[currentIndex] = 1;
  scaleIntervals.forEach(function(interval)
  {
    intervalIndex = Tonal.Interval.semitones(interval) + offset;
    intervals[intervalIndex % 12] = 1;
  });

  var score = 0;
  var base = 0;

  for (var index = 0; index < intervalsToMatch.length; index++)
  {
      if (intervalsToMatch[index] === 1)
      {
        score+= intervals[index] === 1 ? 1 : -1;
        base += 1;
      }
  }
  return score/base;
}

// try to detect the scale name from a list of note indexes

matchScaleListFromIndexes = function(indexes, scaleList)
{
  //  console.log(indexes);

    var bestScore = 0;
    var winnerList = [];

    scaleList.forEach(function(scaleName)
    {
      for (var offset = 0; offset < 12; offset++)
      {
        score = computeScaleScore(scaleName, indexes , offset);
        if (score > bestScore)
        {
          bestScore = score;
          winnerList = [];
        }

        if (score === bestScore)
        {
          winnerList.push("" + Tonal.transpose('c',Tonal.Interval.fromSemitones(offset)) + " " + scaleName);
        }
      }
    })

    var result =
    {
      score_ : bestScore,
      scaleList_ : winnerList
    };
    return result;
}


scalesFromIndexes = function(indexes)
{
  // do not return chromatic scales as they make little sense in our context
   return matchScaleListFromIndexes(indexes, Tonal.scale.names().filter(name => name != "chromatic"));
}

// Attempts to order the scale list so that the ones contaning the firt note
// are presented first

filterScaleResult = function(result, tonic)
{
  var scaleSet;
  if (tonic) {
    var targetRoot = Tonal.Note.chroma(tonic);
    scaleSet = result.scaleList_.filter(scale => (Tonal.Note.chroma(scale.split(" ",1)[0]) == targetRoot));
  }
  else {
    scaleSet = result.scaleList_;
  }

  var calcWeight = function(scale)
  {
    var scaleOrder =  ["major", "aeolian", "harmonic minor", "dorian", "phrygian", "lydian", "mixolydian", "locrian"];
    var scaleName = scale.substring(scale.indexOf(" ") + 1);
    var index = scaleOrder.indexOf(scaleName);
    var weight = index < 0 ? 0 : scaleOrder.length - index;
    return weight;
  }

  if (scaleSet.length != 0)
  {
    result.scaleList_ = scaleSet.filter(s => calcWeight(s) > 0);
  }
  return result;
}

// try to detect possible scales from a list of notes

scalesFromNotes = function(noteNameList, restrictRootNote)
{
  var indexes = [0,0,0,0,0,0,0,0,0,0,0,0];

  noteNameList.forEach(function(noteName)
  {
    indexes[Tonal.Note.chroma(noteName)] = 1;
  });

  var tonic  = restrictRootNote ? noteNameList[0] : null;
  return filterScaleResult(scalesFromIndexes(indexes), tonic);
}

// try to detect the scale name from a list of chord names

scalesFromChords = function(chordNameList, restrictRootNote)
{
  var indexes = [0,0,0,0,0,0,0,0,0,0,0,0];
  chordNameList.forEach(function(chordName)
  {
    var chordIndexes = Tonal.Chord.notes(chordName).map((note) => Tonal.Note.chroma(note));
    chordIndexes.forEach(function(index)
    {
      indexes[index] = 1;
    })
  })

  var tonic = restrictRootNote ? Tonal.Chord.notes(chordNameList[0])[0] : null;
  return filterScaleResult(scalesFromIndexes(indexes), tonic);
}
