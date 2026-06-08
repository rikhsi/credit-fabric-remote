/**
 * Masks a account number showing first 5 and last 3 digits
 * '22620000904895695002' → '22620 ** 002'
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return '';

  const cleaned = accountNumber.replace(/\s/g, '');

  if (cleaned.length < 8) return accountNumber;

  const first = cleaned.slice(0, 5);
  const last  = cleaned.slice(-3);

  return `${first} ** ${last}`;
}

/**
 * maskNumberShort('22620000404694350008');
// 👉 "2262....0008"
 * @param value 
 *
 * @param visibleStart 
 * @param visibleEnd 
 * @param mask 
 * @returns 
 */

export function maskNumberShort(
  value: string | number | undefined,
  visibleStart = 4,
  visibleEnd = 4,
  mask = '····'
): string {
  if (!value) return '';
  const str = String(value);
  if (str.length <= visibleStart + visibleEnd) return str;

  return `${str.slice(0, visibleStart)}<span class="mask-dots"> ${mask} </span>${str.slice(-visibleEnd)}`;
}