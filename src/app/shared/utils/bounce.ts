export function coerceBounceDelay(value: number | string | boolean | undefined): number {
  if (value === undefined || value === null || value === '' || value === true) {
    return 100;
  }

  if (value === false) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 100;
}
