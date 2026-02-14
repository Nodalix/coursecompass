export const BUSINESS_MINOR = {
  name: 'Business Administration',
  totalUnits: 18,
  upperDivisionMin: 9,
  allowsDoubleDip: false,
  doubleDipWarning: 'Eller College does NOT permit double-use of minor courses with majors or minors outside the college. All 18 units must be unique to the minor.',
  lowerDivision: [
    { code: 'MIS 111', name: 'Computers & Internetworked Society', units: 3, note: 'Spring/Summer only for minors' },
    { code: 'ECON 200', name: 'Intro to Economics', units: 3, genEd: 'EP: Social Scientist' },
    { code: 'ACCT 250', name: 'Information for Business Decisions', units: 3, note: 'Spring/Summer preferred' },
  ],
  upperDivision: [
    { code: 'BNAD 301', name: 'Global & Financial Economics', units: 3, prereq: 'ECON 200' },
    { code: 'BNAD 302', name: 'Organizational Behavior & Management', units: 3, note: 'Summer 2nd 7-wk' },
    { code: 'BNAD 303', name: 'Marketing Overview', units: 3, note: 'Spring 2nd 7-wk' },
  ],
} as const;
