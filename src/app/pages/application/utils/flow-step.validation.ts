import { isFlowAddressFilled } from '../constants/address-type';
import { isFlowFinanceFilled } from '../constants/finance';
import { FlowExtraInformationForm, FlowForm } from '../models/form';

function isPresent(value: unknown): boolean {
  return value != null && value !== '';
}

export function isFlowExtraInformationFilled(item: FlowExtraInformationForm): boolean {
  return (
    isPresent(item.sectorEconomy) &&
    isPresent(item.objectNewFormation) &&
    isPresent(item.enterpriseClassifier) &&
    isPresent(item.ecologicalImpactCode)
  );
}

function isFlowScalarsValid(form: FlowForm): boolean {
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
    isPresent(form.id) &&
    isPresent(form.name)
  );
}

export function isGeneralStepValid(form: FlowForm): boolean {
  if (!isFlowScalarsValid(form)) {
    return false;
  }

  return form.addresses.every(isFlowAddressFilled);
}

export function isFinanceStepValid(form: FlowForm): boolean {
  return isFlowFinanceFilled(form.finance);
}
