export const MONTH_NAMES = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
];

export function monthIndexByLabel(label: string): number {
  return MONTH_NAMES.indexOf(label);
}