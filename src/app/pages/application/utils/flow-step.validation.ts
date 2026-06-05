import { isFlowAddressFilled } from './address';
import { isFlowFinanceFilled } from './finance';
import { OnlineCreateApplicationPayload, OnlineStartProcessingExtraInformation } from '@api/models/los/online';

function isPresent(value: unknown): boolean {
  return value != null && value !== '';
}

export function isFlowExtraInformationFilled(item: OnlineStartProcessingExtraInformation): boolean {
  return (
    isPresent(item.sectorEconomy) &&
    isPresent(item.objectNewFormation) &&
    isPresent(item.enterpriseClassfier) &&
    isPresent(item.ecologicalImpactCode)
  );
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
    isPresent(form.name)
  );
}

export function isGeneralStepValid(form: OnlineCreateApplicationPayload): boolean {
  if (!isFlowScalarsValid(form)) {
    return false;
  }

  return form.addresses.every(isFlowAddressFilled);
}

export function isFinanceStepValid(form: OnlineCreateApplicationPayload): boolean {
  return isFlowFinanceFilled(form.finData);
}
