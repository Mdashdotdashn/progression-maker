const Tonal = require('tonal');
require("./js/mn-scale.js");

// Input Chord chordStack

function selectScale(pitchClassCollection)
{
  var scaleList = scalesFromNotes(pcCollection, false).scaleList_;
  return scaleList[Math.floor(Math.random() * Math.floor(scaleList.length))];
}

function degreesToString(scaleName, degreeList)
{
  var scaleNotes = Tonal.Scale.notes(scaleName);
  return degreeList.sort().map(degreeIndex => scaleNotes[degreeIndex]);
}

//var chordStack = [ ["c4", "g3", "e3"], ["a#3", "g3", "d3"]];
var chordStack = [["a#3", "g3", "d3"],  ["d3", "f3", "a3"]];
console.log(chordStack);

//
var toPitchClass = (stack) => stack.map(n => Tonal.Note.pc(n));
var pitchClassStack = chordStack.map(stack => toPitchClass(stack));

var pcCollection = pitchClassStack.reduce((accumulator, currentValue) => accumulator.concat(currentValue));
var selectedScale = selectScale(pitchClassStack);
console.log("Selecting " + selectedScale);

var scaleNotes = Tonal.Scale.notes(selectedScale);
var dumpDegrees = degreeList => degreesToString(selectedScale, degreeList);
var dumpStack = stack => stack.map(s => dumpDegrees(s));

console.log("Scale notes " + scaleNotes);

var degreeIndexes =  n => scaleNotes.reduce(
                        (accumulator, note, index) => { return Tonal.Distance.semitones(note,n) == 0 ? index : accumulator }, -1);

// from the last chord, find possible targets

var lastChordDegrees = pitchClassStack[1].map(degreeIndexes);
console.log("Last chord degrees "+lastChordDegrees);
var targetDegrees = [
  lastChordDegrees.map(n => (n + 1 + 7) % 7),
  lastChordDegrees.map(n => (n - 1 + 7) % 7)
];

console.log("target degrees", targetDegrees);

var selection = new Array();

lastChordDegrees.forEach(function(chordDegree, chordDegreeIndex)
  {
    // Go over all target degrees;
//    console.log("matching degree " + chordDegree + " at index "+ chordDegreeIndex);
    targetDegrees.forEach(function(target)
    {
      // Compute the minimum distance to current selected chord degree
      var minDistance = target.reduce((distance, targetDegree, targetDegreeIndex) =>
      {
        var d = distance;
        if (targetDegreeIndex != chordDegreeIndex)
        {
          var v = Math.abs(chordDegree - targetDegree);
          if (v > 3) v = 7 -v;
          d = Math.min(d, v);
        }
        return d;
      }, 1000);

//      console.log("target " + target + "> distance min" + d);
      if (minDistance > 1)
      {
        var result = target;
        result[chordDegreeIndex] = chordDegree;
        console.log("Selecting ", result);
        selection.push(result);
      }
    })
  });

  console.log("selection", selection);

// Pick one that isn't the first chord
var firstChordDegrees = pitchClassStack[0].map(degreeIndexes).sort();
console.log(firstChordDegrees);
var filteredSelect = selection.filter(stack => {var sorted = stack; sorted.sort() ;return sorted.join() != firstChordDegrees.join()});
console.log("filtered ", filteredSelect);

var selected = filteredSelect[Math.floor(Math.random() * Math.floor(filteredSelect.length))];
console.log(selected);
console.log(dumpDegrees(selected));
// Make note names
