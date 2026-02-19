// songs.js - Basslab Song Library v1.85
const TRANSPOSE_SEMITONES = -36; 

const NOTES = {
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 
  'C5': 523.25, 'rest': 0
};

const SONG_LIBRARY = {
    song1: {
    title: "Mary Had a Little Lamb",
    trim: 0,
    notes: [
      {n:'E4', d:800}, {n:'D4', d:800}, {n:'C4', d:800}, {n:'D4', d:800}, {n:'E4', d:800}, {n:'E4', d:800}, {n:'E4', d:1600},
      {n:'D4', d:800}, {n:'D4', d:800}, {n:'D4', d:1600}, {n:'E4', d:800}, {n:'G4', d:800}, {n:'G4', d:1600},
      {n:'E4', d:800}, {n:'D4', d:800}, {n:'C4', d:800}, {n:'D4', d:800}, {n:'E4', d:800}, {n:'E4', d:800}, {n:'E4', d:800}, {n:'E4', d:800},
      {n:'D4', d:800}, {n:'D4', d:800}, {n:'E4', d:800}, {n:'D4', d:800}, {n:'C4', d:2400}
    ]
  },

  song2: {
    title: "Frere Jacques",
    trim: 0,
    notes: [
      {n:'C4', d:800}, {n:'D4', d:800}, {n:'E4', d:800}, {n:'C4', d:800},
      {n:'C4', d:800}, {n:'D4', d:800}, {n:'E4', d:800}, {n:'C4', d:800},
      {n:'E4', d:800}, {n:'F4', d:800}, {n:'G4', d:1600}, {n:'E4', d:800}, {n:'F4', d:800}, {n:'G4', d:1600},
      {n:'G4', d:400}, {n:'A4', d:400}, {n:'G4', d:400}, {n:'F4', d:400}, {n:'E4', d:800}, {n:'C4', d:800},
      {n:'G4', d:400}, {n:'A4', d:400}, {n:'G4', d:400}, {n:'F4', d:400}, {n:'E4', d:800}, {n:'C4', d:800}
    ]
  },
  song3: { title: "Battle Hymn of the Republic", trim: 0, notes: [{n:'G3', d:600}, {n:'C4', d:600}, {n:'E4', d:600}, {n:'G4', d:1200}] },
  song4: { title: "John Brown’s Body", trim: 0, notes: [{n:'C4', d:400}, {n:'C4', d:400}, {n:'G4', d:400}, {n:'G4', d:400}] },
  song5: { title: "This Land Is Your Land", trim: 0, notes: [{n:'E4', d:400}, {n:'C4', d:400}, {n:'D4', d:400}, {n:'G3', d:800}] },
  song6: { title: "Twinkle Twinkle Little Star", trim: 0, notes: [{n:'C4', d:400}, {n:'C4', d:400}, {n:'G4', d:400}, {n:'G4', d:400}, {n:'A4', d:400}, {n:'A4', d:400}, {n:'G4', d:800}] },
  song7: { title: "Row Row Row Your Boat", trim: 0, notes: [{n:'C4', d:600}, {n:'C4', d:600}, {n:'C4', d:400}, {n:'D4', d:200}, {n:'E4', d:600}] },
  song8: { title: "Old MacDonald Had a Farm", trim: 0, notes: [{n:'G4', d:400}, {n:'G4', d:400}, {n:'G4', d:400}, {n:'D4', d:400}, {n:'E4', d:400}, {n:'E4', d:400}, {n:'D4', d:800}] }
};