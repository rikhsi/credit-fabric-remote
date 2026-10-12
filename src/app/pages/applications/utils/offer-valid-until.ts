/** Bank offer stays open for this many days after `updateDate`. */
export const OFFER_VALID_DAYS = 3;

export function parseApiDate(value: string | Date | null | undefined): Date | null {
  if (value == null || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Last calendar day the offer is still valid: `updateDate` + 3 days. */
export function offerValidUntil(updateDate: string | Date | null | undefined): Date | null {
  const start = parseApiDate(updateDate);

  if (!start) {
    return null;
  }

  const until = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  until.setDate(until.getDate() + OFFER_VALID_DAYS);

  return until;
}
