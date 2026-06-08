export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function parseDate(str: string): Date {
  const [datePart, timePart] = str.split(' ');
  const [day, month, year] = datePart.split('.');
  return new Date(`${year}-${month}-${day}T${timePart}`);
}
