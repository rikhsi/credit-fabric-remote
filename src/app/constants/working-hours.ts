import { environment } from 'src/environments/development';

export const WORKING_HOURS = environment.workingHours;

/** Reads the weekday and hour in the working hours time zone, regardless of the device one. */
export const WORKING_HOURS_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: WORKING_HOURS.timeZone,
  weekday: 'short',
  hour: 'numeric',
  hourCycle: 'h23',
});
