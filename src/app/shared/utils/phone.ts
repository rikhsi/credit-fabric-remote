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
