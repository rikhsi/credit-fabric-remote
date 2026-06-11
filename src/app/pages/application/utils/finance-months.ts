import { FinanceMonthPeriod } from '../data/finance';
import { OnlineCreateApplicationPayload, OnlineStartProcessingFinData } from '@api/models/los/start-processing';

/** Masked inputs store numeric values as strings (e.g. "4 434 343"). */
function toApiNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  return Number(String(value ?? '').replace(/\s/g, ''));
}

function toApiYearString(value: number): string {
  return String(value);
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
    monthYear1: toApiYearString(periods[0].year),
    monthYear2: toApiYearString(periods[1].year),
    monthYear3: toApiYearString(periods[2].year),
  };
}

function normalizeFinDataForApi(
  finData: OnlineStartProcessingFinData,
  financeMonths: ReturnType<typeof resolveFinanceMonthsForSubmit>,
): OnlineStartProcessingFinData {
  return {
    dirCompanyActivityId: finData.dirCompanyActivityId,
    activityTerm: toApiNumber(finData.activityTerm),
    sysMonth1Id: financeMonths.sysMonth1Id,
    sysMonth2Id: financeMonths.sysMonth2Id,
    sysMonth3Id: financeMonths.sysMonth3Id,
    month1Revenue: toApiNumber(finData.month1Revenue),
    month1Income: toApiNumber(finData.month1Income),
    month2Revenue: toApiNumber(finData.month2Revenue),
    month2Income: toApiNumber(finData.month2Income),
    month3Revenue: toApiNumber(finData.month3Revenue),
    month3Income: toApiNumber(finData.month3Income),
    monthYear1: financeMonths.monthYear1,
    monthYear2: financeMonths.monthYear2,
    monthYear3: financeMonths.monthYear3,
  };
}

export function buildCreateApplicationPayload(formValue: OnlineCreateApplicationPayload): OnlineCreateApplicationPayload {
  const financeMonths = resolveFinanceMonthsForSubmit();

  return {
    ...formValue,
    employees: toApiNumber(formValue.employees),
    newEmployees: toApiNumber(formValue.newEmployees),
    finData: normalizeFinDataForApi(formValue.finData, financeMonths),
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
