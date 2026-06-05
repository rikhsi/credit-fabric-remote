import { FinanceMonthPeriod } from '../data/finance';
import { flowFinanceFormModel } from '../data/form';
import { OnlineStartProcessingFinData } from '@api/models/los/online';

/** Three calendar months before the current month (oldest → newest). */
export function getLastThreeFinanceMonthPeriods(date = new Date()): FinanceMonthPeriod[] {
  return [3, 2, 1].map((monthsBack) => {
    const periodDate = new Date(date.getFullYear(), date.getMonth() - monthsBack, 1);

    return {
      year: periodDate.getFullYear(),
      month: periodDate.getMonth() + 1,
    };
  });
}

export function toFinanceMonthId(period: FinanceMonthPeriod): string {
  return `${period.year}-${String(period.month).padStart(2, '0')}`;
}

export function parseFinanceMonthId(monthId: string | null | undefined): FinanceMonthPeriod | null {
  if (!monthId) {
    return null;
  }

  const isoMatch = /^(\d{4})-(\d{2})$/.exec(monthId);

  if (isoMatch) {
    return { year: Number(isoMatch[1]), month: Number(isoMatch[2]) };
  }

  return null;
}

export function formatFinanceMonthLabel(period: FinanceMonthPeriod, locale = 'ru-RU'): string {
  const date = new Date(period.year, period.month - 1, 1);

  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

export function formatFinanceMonthPeriodLabel(monthId: string | null | undefined, locale = 'ru-RU'): string {
  const period = parseFinanceMonthId(monthId);

  if (period) {
    return formatFinanceMonthLabel(period, locale);
  }

  return monthId ?? '';
}

export function createDefaultFinanceForm(existing?: Partial<OnlineStartProcessingFinData> | null): OnlineStartProcessingFinData {
  const periods = getLastThreeFinanceMonthPeriods();

  return {
    ...flowFinanceFormModel,
    ...existing,
    sysMonth1Id: existing?.sysMonth1Id ?? toFinanceMonthId(periods[0]),
    sysMonth2Id: existing?.sysMonth2Id ?? toFinanceMonthId(periods[1]),
    sysMonth3Id: existing?.sysMonth3Id ?? toFinanceMonthId(periods[2]),
  };
}

export function ensureFinanceMonthDefaults(finance: OnlineStartProcessingFinData): OnlineStartProcessingFinData {
  if (finance.sysMonth1Id && finance.sysMonth2Id && finance.sysMonth3Id) {
    return finance;
  }

  return createDefaultFinanceForm(finance);
}
