import { FieldTree, ValidationError } from '@angular/forms/signals';
import { isFlowAddressFilled } from './address';
import { parseFinanceAmount } from './finance-months';
import {
  OnlineCreateApplicationPayload,
  OnlineStartProcessingExtraInformation,
  OnlineStartProcessingFinData,
} from '@api/models/los/start-processing';

function isPresent(value: unknown): boolean {
  return value != null && value !== '';
}

export function financeRevenueIncomeError(): ValidationError {
  return { kind: 'revenueLessThanIncome', message: 'alert.revenue_less_than_income' };
}

export function isFinanceMonthRevenueGreaterThanIncome(revenue: unknown, income: unknown): boolean {
  if (!isPresent(revenue) || !isPresent(income)) {
    return true;
  }

  return parseFinanceAmount(revenue) >= parseFinanceAmount(income);
}

export function isFinanceRevenueIncomeValid(finData: OnlineStartProcessingFinData): boolean {
  return (
    isFinanceMonthRevenueGreaterThanIncome(finData.month1Revenue, finData.month1Income) &&
    isFinanceMonthRevenueGreaterThanIncome(finData.month2Revenue, finData.month2Income) &&
    isFinanceMonthRevenueGreaterThanIncome(finData.month3Revenue, finData.month3Income)
  );
}

export function validateFinanceMonthRevenueIncome(revenue: unknown, income: unknown): ValidationError | null {
  return isFinanceMonthRevenueGreaterThanIncome(revenue, income) ? null : financeRevenueIncomeError();
}

function isFlowScalarsValid(form: OnlineCreateApplicationPayload): boolean {
  return (
    isPresent(form.oked) &&
    isPresent(form.employees) &&
    isPresent(form.newEmployees) &&
    isPresent(form.legalForm) &&
    isPresent(form.ownershipCode) &&
    isPresent(form.registrationDate) &&
    isPresent(form.registrationNumber) &&
    isPresent(form.registrationPlaceCode) &&
    isPresent(form.workPhone) &&
    isPresent(form.docPersonalLegalNo) &&
    isPresent(form.email) &&
    isPresent(form.name) &&
    isPresent(form.accountNo)
  );
}

function isFlowExtraInformationFilled(item: OnlineStartProcessingExtraInformation): boolean {
  return (
    isPresent(item.sectorEconomy) &&
    isPresent(item.objectNewFormation) &&
    isPresent(item.enterpriseClassfier) &&
    isPresent(item.ecologicalImpactCode)
  );
}

export function isGeneralStepValid(form: FieldTree<OnlineCreateApplicationPayload>): boolean {
  const value = form().value();

  if (!isFlowScalarsValid(value)) {
    return false;
  }

  if (!isFlowExtraInformationFilled(value.extraInformation)) {
    return false;
  }

  return value.addresses.every(isFlowAddressFilled);
}

export function isFinanceStepValid(form: FieldTree<OnlineCreateApplicationPayload>): boolean {
  const finData = form().value().finData;

  return (
    isPresent(finData?.dirCompanyActivityId) &&
    isPresent(finData?.activityTerm) &&
    isPresent(finData?.month1Revenue) &&
    isPresent(finData?.month1Income) &&
    isPresent(finData?.month2Revenue) &&
    isPresent(finData?.month2Income) &&
    isPresent(finData?.month3Revenue) &&
    isPresent(finData?.month3Income) &&
    isFinanceRevenueIncomeValid(finData)
  );
}
