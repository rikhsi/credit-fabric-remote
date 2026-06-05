import { FieldTree } from '@angular/forms/signals';
import { isFlowAddressFilled } from './address';
import { OnlineCreateApplicationPayload, OnlineStartProcessingExtraInformation } from '@api/models/los/start-processing';

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

export function isFinanceStepValid(form: FieldTree<OnlineCreateApplicationPayload>): boolean {
  const finData = form().value().finData;

  return (
    isPresent(finData?.dirCompanyActivityId) &&
    isPresent(finData?.activityTerm) &&
    isPresent(finData?.sysMonth1Id) &&
    isPresent(finData?.month1Revenue) &&
    isPresent(finData?.month1Income) &&
    isPresent(finData?.sysMonth2Id) &&
    isPresent(finData?.month2Revenue) &&
    isPresent(finData?.month2Income) &&
    isPresent(finData?.sysMonth3Id) &&
    isPresent(finData?.month3Revenue) &&
    isPresent(finData?.month3Income)
  );
}
