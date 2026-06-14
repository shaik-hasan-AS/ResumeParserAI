const assert = require('assert');

function reorderCustomSections(state, startIndex, endIndex) {
  const secs = Array.from(state.parsedData.custom_sections || []);
  const [removed] = secs.splice(startIndex, 1);
  secs.splice(endIndex, 0, removed);
  return { parsedData: { ...state.parsedData, custom_sections: secs } };
}

let state = {
  parsedData: {
    custom_sections: [
      { id: '1', title: 'A' },
      { id: '2', title: 'B' },
      { id: '3', title: 'C' }
    ]
  }
};

let newState = reorderCustomSections(state, 1, 0); // move 'B' up to 'A's position
console.log(newState.parsedData.custom_sections);
// expected: B, A, C

let newState2 = reorderCustomSections(newState, 0, 1); // move 'B' down
console.log(newState2.parsedData.custom_sections);
// expected: A, B, C

