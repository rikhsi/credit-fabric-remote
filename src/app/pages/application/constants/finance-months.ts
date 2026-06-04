import { FlowFinanceForm } from '../models/form';
import { flowFinanceFormModel } from '../data/form';

export interface FinanceMonthPeriod {
  year: number;
  month: number;
}

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

export function createDefaultFinanceForm(existing?: Partial<FlowFinanceForm> | null): FlowFinanceForm {
  const periods = getLastThreeFinanceMonthPeriods();

  return {
    ...flowFinanceFormModel,
    ...existing,
    month1: existing?.month1 ?? toFinanceMonthId(periods[0]),
    month2: existing?.month2 ?? toFinanceMonthId(periods[1]),
    month3: existing?.month3 ?? toFinanceMonthId(periods[2]),
  };
}

export function ensureFinanceMonthDefaults(finance: FlowFinanceForm): FlowFinanceForm {
  if (finance.month1 && finance.month2 && finance.month3) {
    return finance;
  }

  return createDefaultFinanceForm(finance);
}
