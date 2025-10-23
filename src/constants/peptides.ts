export const CURRENT_PEPTIDE_FILES = [
  'bpc-157',
  'cjc-1295',
  'cjc-1295-ipamorelin',
  'ibutamoren',
  'igf-1lr3',
  'ipamorelin',
  'retatrutide',
  'semaglutide',
  'tb-500',
  'tirzepatide',
  'vosilasarm',
] as const;

export type PeptideSlug = typeof CURRENT_PEPTIDE_FILES[number];

export const PEPTIDE_TAGS = [
  // Primary benefits
  'muscle gain',
  'fat loss',
  'weight loss',
  'sleep',
  'skin and hair',
  'recovery',
  'healing',
  'tissue repair',
  'bone density',
  'gut health',
  'anti-inflammatory',
  'anti-aging',
  
  // Mechanisms
  'growth hormone',
  'GHRH',
  'GHS',
  'selective agonist',
  'triple agonist',
  'sarm',
  
  // Health conditions
  'diabetes',
  'cardiovascular',
  'metabolic health',
  'sleep apnea',
  'breast cancer',
  
  // Administration routes
  'oral',
  'injectable',
  'subcutaneous',
  'intramuscular',
  ] as const;

export type PeptideTag = typeof PEPTIDE_TAGS[number];
