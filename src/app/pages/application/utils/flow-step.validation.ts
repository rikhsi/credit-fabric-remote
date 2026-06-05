import { FieldTree } from '@angular/forms/signals';
import { isFlowAddressFilled } from './address';
import { OnlineCreateApplicationPayload, OnlineStartProcessingExtraInformation } from '@api/models/los/online';

function isPresent(value: unknown): boolean {
  return value != null && value !== '';
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
    String(form.docPersonalLegalNo).length === 14 &&
    isPresent(form.email) &&
    isPresent(form.name)
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
