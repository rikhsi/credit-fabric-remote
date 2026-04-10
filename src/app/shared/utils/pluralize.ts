import { translate } from '@jsverse/transloco';
import { SCALE_PREFIXES_BY_VALUE } from '@constants';
import { Scale } from '@typings';

export function pluralize(count: number, forms: [string, string, string]): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 19) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

export function scalePrefix(value: number): keyof typeof SCALE_PREFIXES_BY_VALUE {
  if (value >= 1_000_000_000) return 'billion';
  if (value >= 1_000_000) return 'million';
  if (value >= 1_000) return 'thousand';
  return 'none';
}

export function formatScaledNumber(value: number, prefixMap: Record<Scale, string>): string {
  const { value: v, scale } = normalizeNumber(value);

  return `${v} ${translate(prefixMap[scale])}`;
}

export function normalizeNumber(value: number): {
  value: number;
  scale: Scale;
} {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return { value: value / 1_000_000_000, scale: 'billion' };
  }

  if (abs >= 1_000_000) {
    return { value: value / 1_000_000, scale: 'million' };
  }

  if (abs >= 1_000) {
    return { value: value / 1_000, scale: 'thousand' };
  }

  return { value, scale: 'none' };
}
