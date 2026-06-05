import { FinanceMonthPeriod } from '../data/finance';
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

export type FinanceMonthSlot = 1 | 2 | 3;

export function getFinanceMonthDateBySlot(slot: FinanceMonthSlot, date = new Date()): Date {
  const period = getLastThreeFinanceMonthPeriods(date)[slot - 1];

  return new Date(period.year, period.month - 1, 1);
}

/** SYS_MONTH id is the calendar month number: January = "1", December = "12". */
export function toSysMonthId(month: number): string {
  return String(month);
}

export function resolveFinanceMonthsForSubmit(
  date = new Date(),
): Pick<OnlineStartProcessingFinData, 'sysMonth1Id' | 'sysMonth2Id' | 'sysMonth3Id' | 'monthYear1' | 'monthYear2' | 'monthYear3'> {
  const periods = getLastThreeFinanceMonthPeriods(date);

  return {
    sysMonth1Id: toSysMonthId(periods[0].month),
    sysMonth2Id: toSysMonthId(periods[1].month),
    sysMonth3Id: toSysMonthId(periods[2].month),
    monthYear1: periods[0].year,
    monthYear2: periods[1].year,
    monthYear3: periods[2].year,
  };
}

export function buildCreateApplicationPayload(formValue: OnlineCreateApplicationPayload): OnlineCreateApplicationPayload {
  return {
    ...formValue,
    finData: {
      ...formValue.finData,
      ...resolveFinanceMonthsForSubmit(),
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
