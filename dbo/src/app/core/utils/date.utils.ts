export type DateFormat = 'DDMMYYYY' | 'MMDDYYYY' | 'YYYYMMDD';
export type DateSeparator = '.' | '-' | '/'
export type PeriodType = 'today' | 'yesterday' | 'week' | 'month' | 'year';

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};



export function formatDate(date?: string | Date | null , format: DateFormat = 'DDMMYYYY', separator:DateSeparator  = '.'): string | null{
  if (!date) return null;

  const parsedDate = date instanceof Date ? date : new Date(date);
  if (isNaN(parsedDate.getTime())) return null;

  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = parsedDate.getFullYear();

  switch (format) {
    case 'MMDDYYYY':
      return [month, day, year].join(separator);
    case 'YYYYMMDD':
      return [year, month, day].join(separator);
    case 'DDMMYYYY':
    default:
      return [day, month, year].join(separator);
  }
}


export function getDateRange(period: PeriodType): { startDate: Date; endDate: Date } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();


  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'today':
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;

    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      startDate = startOfDay(yesterday);
      endDate = endOfDay(yesterday);
      break;

    case 'week':
      endDate = endOfDay(now);
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 6);
      startDate = startOfDay(sevenDaysAgo);
      break;

    case 'month':
      startDate = startOfDay(new Date(currentYear, currentMonth, 1));
      endDate = endOfDay(new Date(currentYear, currentMonth + 1, 0));
      break;

    case 'year':
      startDate = startOfDay(new Date(currentYear, 0, 1));
      endDate = endOfDay(new Date(currentYear + 1, 0, 0));
      break;

    default:
      throw new Error(`Invalid period type provided: ${period}`);
  }

  return { startDate, endDate };
}


export function detectPeriodLabel(startDate: Date, endDate: Date): string {
    const dateFormatter = (d: Date) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

    const knownRanges: { period: PeriodType, label: string }[] = [
        { period: 'today', label: 'Сегодня' },
        { period: 'yesterday', label: 'Вчера' },
        { period: 'week', label: 'Период (7 дней)' },
        { period: 'month', label: 'Текущий месяц' },
        // ... include other period types if needed (lastMonth, year, etc.)
    ];

    for (const { period, label } of knownRanges) {
        const { startDate: knownStart, endDate: knownEnd } = getDateRange(period);
        if (startDate.getTime() === knownStart.getTime() && endDate.getTime() === knownEnd.getTime()) {
            if (period === 'today' || period === 'yesterday') {
                return `${label} ${dateFormatter(startDate)}`;
            }
            return `${label}: ${dateFormatter(startDate)} – ${dateFormatter(endDate)}`;
        }
    }
    return `${dateFormatter(startDate)} – ${dateFormatter(endDate)}`;
}


export function formatDateRange(start: string | null, end: string | null): string {
  if (!start || !end) return '';
  const parseDate = (dateStr: string): Date => new Date(dateStr);

  const format = (dateStr: string): string => {
    const date = parseDate(dateStr);
    if (isNaN(date.getTime())) return ''; // invalid date
    return date
      .toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, '.'); // ensure dot separator
  };

  const s = format(start);
  const e = format(end);

  if (!s || !e) return '';

  return `С ${s} по ${e}`;
}



export function formatTimestamp(dateString: string | undefined): string {
  if(!dateString) return ""
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  // If within 24 hours
  if (diffHours < 24) {
    if (diffMin < 1) return 'Только что';
    if (diffMin < 60) return `${diffMin} мин назад`;
    return `${diffHours} ч назад`;
  }

  // If older than a day
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}г.`;
}



