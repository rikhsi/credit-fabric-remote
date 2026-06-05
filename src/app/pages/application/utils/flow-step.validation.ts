import { FieldTree } from '@angular/forms/signals';
import { isFlowAddressFilled } from './address';
import { OnlineCreateApplicationPayload } from '@api/models/los/online';

function isFlowScalarsValid(form: FieldTree<OnlineCreateApplicationPayload>): boolean {
  return (
    form.oked().valid() &&
    form.employees().valid() &&
    form.newEmployees().valid() &&
    form.legalForm().valid() &&
    form.ownershipCode().valid() &&
    form.registrationDate().valid() &&
    form.registrationNumber().valid() &&
    form.registrationPlaceCode().valid() &&
    form.workPhone().valid() &&
    form.docPersonalLegalNo().valid() &&
    form.email().valid() &&
    form.name().valid()
  );
}

export function isGeneralStepValid(form: FieldTree<OnlineCreateApplicationPayload>): boolean {
  if (!isFlowScalarsValid(form)) {
    return false;
  }

  return form.addresses().value().every(isFlowAddressFilled);
}
