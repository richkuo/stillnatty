export const CURRENT_PEPTIDE_FILES = [
  'bpc-157',
  'cjc-1295',
  'ibutamoren',
  'ipamorelin',
  'retatrutide',
  'semaglutide',
  'sermorelin',
  'tirzepatide',
] as const;

export type PeptideSlug = typeof CURRENT_PEPTIDE_FILES[number];

export const PEPTIDE_TAGS = [
  'muscle gain',
  'fat loss',
  'sleep',
  'skin and hair',
  'recovery',
  'healing',
  'growth hormone',
  'sarm',
  'oral',
  'injectable',
  'subcutaneous',
  'intramuscular',
] as const;

export type PeptideTag = typeof PEPTIDE_TAGS[number];
