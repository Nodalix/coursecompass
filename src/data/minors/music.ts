export const MUSIC_MINOR = {
  name: 'Music',
  totalUnits: 18,
  upperDivisionMin: 9,
  required: [
    { code: 'MUS 119', name: 'Intro to Music Theory', units: 3 },
  ],
  electiveUnits: 15,
  electiveNote: 'Any 15 additional MUS/MUSI units',
  allowsDoubleDip: true,
  doubleDipCourses: [
    { code: 'MUS 109', genEd: 'EP: Artist' },
    { code: 'MUS 160D1', genEd: 'EP: Artist' },
    { code: 'MUS 327', genEd: 'Building Connections' },
    { code: 'MUS 334', genEd: 'Building Connections' },
    { code: 'MUS 337', genEd: 'Building Connections' },
  ],
  advisor: { name: 'Christina Beasley', email: 'cswanson@arizona.edu' },
} as const;
