export function normalizePhoneNumber(phone: string | undefined | null): string {
  if (!phone) {
    return '';
  }

  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('998')) {
    return digits.slice(3);
  }

  return digits;
}

export function toUzFullPhoneDigits(value: unknown): string | null {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (digits.length === 12 && digits.startsWith('998')) {
    return digits;
  }

  if (digits.length === 9) {
    return `998${digits}`;
  }

  return null;
}

export function formatPhoneNumber(value: unknown, hidden = false): string {
  const digits = toUzFullPhoneDigits(value);

  if (!digits) {
    return value ? String(value) : '';
  }

  const country = digits.slice(0, 3);
  const operator = digits.slice(3, 5);
  const part1 = digits.slice(5, 8);
  const part2 = digits.slice(8, 10);
  const part3 = digits.slice(10, 12);

  if (hidden) {
    return `+${country} (${operator}) •••-••-${part3}`;
  }

  return `+${country} (${operator}) ${part1}-${part2}-${part3}`;
}
