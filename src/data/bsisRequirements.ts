export const BSIS_REQUIREMENTS = {
  name: 'BS Information Science',
  shortName: 'BSIS',
  core: [
    { code: 'ISTA 100', name: 'Great Ideas of the Information Age', units: 3 },
    { code: 'ISTA 116', name: 'Statistical Foundations', units: 3 },
    { code: 'ISTA 130', name: 'Computational Thinking & Doing', units: 4 },
    { code: 'ISTA 131', name: 'Dealing with Data', units: 4 },
    { code: 'ISTA 161', name: 'Ethics in a Digital World', units: 3 },
  ],
  additionalRequired: [
    { code: 'ESOC 302', name: 'Quant Methods for Digital Marketplace', units: 3 },
    { code: 'ISTA 498', name: 'Senior Capstone', units: 3 },
  ],
  electives: [
    { label: 'Computational Arts & Media', units: 3, pick: 1 },
    { label: 'Society', units: 3, pick: 1 },
    { label: 'Engagement (Internship/Ind. Study/ESOC 480)', units: 3, pick: 1 },
  ],
  emphases: {
    data_science: {
      name: 'Data Science',
      units: 15,
      courses: ['ISTA 311', 'ISTA 320', 'ISTA 321', 'ISTA 322', 'ISTA 331', 'ISTA 350', 'ISTA 421', 'ISTA 450'],
    },
    interactive: {
      name: 'Interactive & Immersive Tech',
      units: 15,
      courses: ['ISTA 230', 'ISTA 252', 'ISTA 301', 'ISTA 303', 'ISTA 329', 'ISTA 330', 'ISTA 352', 'ISTA 411'],
    },
    ai: {
      name: 'Artificial Intelligence',
      units: 15,
      note: 'New Fall 2026',
      courses: ['ISTA 421', 'ISTA 450', 'ISTA 321', 'ISTA 457'],
    },
  },
} as const;
