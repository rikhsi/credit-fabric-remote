import { WORKING_HOURS, WORKING_HOURS_FORMATTER } from '@app/constants/working-hours';

export function isWorkingTime(date: Date): boolean {
  const { workingDays, openHour, closeHour } = WORKING_HOURS;
  const parts = WORKING_HOURS_FORMATTER.formatToParts(date);
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value);

  return workingDays.includes(weekday) && hour >= openHour && hour < closeHour;
}

export function formatWorkingHours(): string {
  const { openHour, closeHour } = WORKING_HOURS;
  const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

  return `${formatHour(openHour)} - ${formatHour(closeHour)}`;
}
