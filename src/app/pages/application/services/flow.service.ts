import { Injectable, signal } from '@angular/core';
import { form, required, requiredError, validate } from '@angular/forms/signals';
import { isFlowAddressFilled, mergeRequiredAddresses } from '../constants/address-type';
import { isFlowFinanceFilled } from '../constants/finance';
import { isFlowExtraInformationFilled } from '../utils/flow-step.validation';
import { flowExtraInformationFormModel, flowFinanceFormModel, flowFormModel } from '../data/form';
import {
  buildStartProcessingPayload as buildStartProcessingPayloadFromForm,
  mapFinDataToFlowForm,
  mapFlowExtraInformationsToStartProcessing,
  mapFlowFinanceInformationsToStartProcessing,
} from '../utils/start-processing.mapper';
import {
  OnlineApplication,
  OnlineCreateApplicationPayload,
  OnlineStartProcessingExtraInformation,
  OnlineStartProcessingFinData,
} from '@api/models/los/online';

@Injectable()
export class FlowService {
  public readonly flowForm = form(signal(flowFormModel), (schemaPath) => {
    required(schemaPath.oked);
    required(schemaPath.employees);
    required(schemaPath.newEmployees);
    required(schemaPath.legalForm);
    required(schemaPath.ownershipCode);
    required(schemaPath.registrationDate);
    required(schemaPath.registrationNumber);
    required(schemaPath.registrationPlaceCode);
    required(schemaPath.workPhone);
    required(schemaPath.docPersonalLegalNo);
    required(schemaPath.email);
    required(schemaPath.id);
    required(schemaPath.name);

    validate(schemaPath.addresses, ({ value }) => (value().every(isFlowAddressFilled) ? null : requiredError()));

    validate(schemaPath.extraInformations, ({ value }) => {
      const items = value();

      if (items.length === 0 || !items.every(isFlowExtraInformationFilled)) {
        return requiredError();
      }

      return null;
    });

    validate(schemaPath.financeInformations, ({ value }) => {
      const items = value();

      if (items.length === 0 || !items.every(isFlowFinanceFilled)) {
        return requiredError();
      }

      return null;
    });
  });

  public initApplication(application: OnlineApplication): void {
    this.flowForm().value.set({
      docPersonalLegalNo: application.borrower.docPersonalLegalNo,
      email: application.borrower.email,
      employees: application.borrower.employees,
      id: application.borrower.id,
      name: application.borrower.name,
      newEmployees: application.borrower.newEmployees,
      legalForm: application.borrower.legalForm.id,
      ownershipCode: application.borrower.ownershipCode.id,
      registrationDate: application.borrower.registrationDate,
      registrationNumber: application.borrower.registrationNumber,
      registrationPlaceCode: application.borrower.registrationPlaceCode,
      workPhone: application.borrower.workPhone,
      addresses: mergeRequiredAddresses(application.adresses ?? []),
      extraInformations: (application.extraInformations ?? []).map((item) => ({
        ...flowExtraInformationFormModel,
        ...item,
      })),
      financeInformations: (application.finData ?? []).map((item) => ({
        ...flowFinanceFormModel,
        ...mapFinDataToFlowForm(item),
      })),
      oked: application.borrower.oked.id,
    });
  }

  public getExtraInformationsForStartProcessing(): OnlineStartProcessingExtraInformation[] {
    return mapFlowExtraInformationsToStartProcessing(this.flowForm().value().extraInformations);
  }

  public getFinDataForStartProcessing(): OnlineStartProcessingFinData[] {
    return mapFlowFinanceInformationsToStartProcessing(this.flowForm().value().financeInformations);
  }

  public buildStartProcessingPayload(applicationId: number): OnlineCreateApplicationPayload {
    return buildStartProcessingPayloadFromForm(this.flowForm().value(), applicationId);
  }
}
