export const cardTypes = [
  'UZCARD',
  'HUMO',
] as const;

export type CardType = (typeof cardTypes)[number];
