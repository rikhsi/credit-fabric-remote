import { FinanceMonthPeriod } from '../data/finance';
import { SysMonthItem } from '@api/models/handbooks';
import { OnlineCreateApplicationPayload, OnlineStartProcessingFinData } from '@api/models/los/start-processing';

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

export function resolveSysMonthId(month: number, items: SysMonthItem[]): string | null {
  const normalizedMonth = String(month).padStart(2, '0');

  const item = items.find(({ code }) => code === normalizedMonth || code === String(month) || Number(code) === month);

  return item?.id ?? null;
}

export type FinanceMonthSlot = 1 | 2 | 3;

export function getFinanceMonthDateBySlot(slot: FinanceMonthSlot, date = new Date()): Date {
  const period = getLastThreeFinanceMonthPeriods(date)[slot - 1];

  return new Date(period.year, period.month - 1, 1);
}

export function resolveFinanceMonthYears(
  date = new Date(),
): Pick<OnlineStartProcessingFinData, 'monthYear1' | 'monthYear2' | 'monthYear3'> {
  const periods = getLastThreeFinanceMonthPeriods(date);

  return {
    monthYear1: periods[0].year,
    monthYear2: periods[1].year,
    monthYear3: periods[2].year,
  };
}

export function resolveFinanceMonthsForSubmit(
  sysMonthItems: SysMonthItem[],
  date = new Date(),
): Pick<OnlineStartProcessingFinData, 'sysMonth1Id' | 'sysMonth2Id' | 'sysMonth3Id' | 'monthYear1' | 'monthYear2' | 'monthYear3'> {
  const periods = getLastThreeFinanceMonthPeriods(date);

  return {
    sysMonth1Id: resolveSysMonthId(periods[0].month, sysMonthItems),
    sysMonth2Id: resolveSysMonthId(periods[1].month, sysMonthItems),
    sysMonth3Id: resolveSysMonthId(periods[2].month, sysMonthItems),
    monthYear1: periods[0].year,
    monthYear2: periods[1].year,
    monthYear3: periods[2].year,
  };
}

export function buildCreateApplicationPayload(
  formValue: OnlineCreateApplicationPayload,
  sysMonthItems: SysMonthItem[],
): OnlineCreateApplicationPayload {
  return {
    ...formValue,
    finData: {
      ...formValue.finData,
      ...resolveFinanceMonthsForSubmit(sysMonthItems),
    },
  };
}

export function createDefaultFinanceForm(existing?: Partial<OnlineStartProcessingFinData> | null): OnlineStartProcessingFinData {
  return {
    dirCompanyActivityId: null,
    activityTerm: null,
    sysMonth1Id: null,
    month1Revenue: null,
    month1Income: null,
    sysMonth2Id: null,
    month2Revenue: null,
    month2Income: null,
    sysMonth3Id: null,
    month3Revenue: null,
    month3Income: null,
    monthYear1: null,
    monthYear2: null,
    monthYear3: null,
    ...existing,
  };
}
