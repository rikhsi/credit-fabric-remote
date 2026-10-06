import { ValidationError } from '@angular/forms/signals';
import { StartProcessingFinData } from '@api/models/los/start-processing';
import { parseFinanceAmount } from './finance-months';

export const ACTIVITY_TERM_MIN_MONTHS = 3;

function isPresent(value: unknown): boolean {
  return value != null && value !== '';
}

export function financeRevenueIncomeError(): ValidationError {
  return { kind: 'revenueLessThanIncome', message: 'alert.revenue_less_than_income' };
}

export function activityTermMinError(): ValidationError {
  return { kind: 'activityTermMin', message: 'validation.error.activityTermMin' };
}

export function isFinanceMonthRevenueGreaterThanIncome(revenue: unknown, income: unknown): boolean {
  if (!isPresent(revenue) || !isPresent(income)) {
    return true;
  }

  return parseFinanceAmount(revenue) >= parseFinanceAmount(income);
}

export function isFinanceRevenueIncomeValid(finData: StartProcessingFinData): boolean {
  return (
    isFinanceMonthRevenueGreaterThanIncome(finData.month1Revenue, finData.month1Income) &&
    isFinanceMonthRevenueGreaterThanIncome(finData.month2Revenue, finData.month2Income) &&
    isFinanceMonthRevenueGreaterThanIncome(finData.month3Revenue, finData.month3Income)
  );
}

export function validateFinanceMonthRevenueIncome(revenue: unknown, income: unknown): ValidationError | null {
  return isFinanceMonthRevenueGreaterThanIncome(revenue, income) ? null : financeRevenueIncomeError();
}

export function isActivityTermValid(value: unknown, minMonths = ACTIVITY_TERM_MIN_MONTHS): boolean {
  if (!isPresent(value)) {
    return false;
  }

  return parseFinanceAmount(value) >= minMonths;
}

export function validateActivityTermMin(value: unknown, minMonths = ACTIVITY_TERM_MIN_MONTHS): ValidationError | null {
  if (!isPresent(value)) {
    return null;
  }

  return isActivityTermValid(value, minMonths) ? null : activityTermMinError();
}

export function isFinDataFilled(finData: StartProcessingFinData | null | undefined): boolean {
  if (!finData) {
    return false;
  }

  return (
    isPresent(finData.dirCompanyActivityId) &&
    isActivityTermValid(finData.activityTerm) &&
    isPresent(finData.month1Revenue) &&
    isPresent(finData.month1Income) &&
    isPresent(finData.month2Revenue) &&
    isPresent(finData.month2Income) &&
    isPresent(finData.month3Revenue) &&
    isPresent(finData.month3Income) &&
    isFinanceRevenueIncomeValid(finData)
  );
}
