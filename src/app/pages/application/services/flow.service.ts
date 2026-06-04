import { inject, Injectable, signal } from '@angular/core';
import { form, maxLength, minLength, required, requiredError, validate } from '@angular/forms/signals';
import { buildRequiredAddresses, isFlowAddressFilled, mergeRequiredAddresses } from '../data/address-type';
import { createDefaultFinanceForm } from '../data/finance-months';
import { isFlowFinanceFilled } from '../data/finance';
import { flowExtraInformationFormModel } from '../data/form';
import {
  buildStartProcessingPayload as buildStartProcessingPayloadFromForm,
  mapFinDataToFlowForm,
  mapFlowExtraInformationsToStartProcessing,
  mapFlowFinanceInformationsToStartProcessing,
} from '../utils/start-processing.mapper';
import { FlowForm } from '../models/form';
import {
  OnlineApplication,
  OnlineCreateApplicationPayload,
  OnlineStartProcessingExtraInformation,
  OnlineStartProcessingFinData,
} from '@api/models/los/online';
import { AuthService } from '@core/services/auth.service';

@Injectable()
export class FlowService {
  private authService = inject(AuthService);

  public readonly flowForm = form(
    signal<FlowForm>({
      name: null,
      ownershipCode: null,
      registrationDate: null,
      docPersonalLegalNo: null,
      email: null,
      employees: null,
      id: null,
      newEmployees: null,
      legalForm: null,
      oked: null,
      registrationNumber: null,
      registrationPlaceCode: null,
      workPhone: null,
      extraInformations: [],
      addresses: buildRequiredAddresses(),
      finance: createDefaultFinanceForm(),
    }),
    (schemaPath) => {
      required(schemaPath.oked);
      required(schemaPath.employees);
      required(schemaPath.newEmployees);
      required(schemaPath.legalForm);
      required(schemaPath.ownershipCode);
      required(schemaPath.registrationDate);
      required(schemaPath.registrationNumber);
      required(schemaPath.registrationPlaceCode);
      required(schemaPath.docPersonalLegalNo);
      required(schemaPath.id);
      required(schemaPath.name);
      minLength(schemaPath.docPersonalLegalNo, 14);
      maxLength(schemaPath.docPersonalLegalNo, 14);

      validate(schemaPath.addresses, ({ value }) => (value().every(isFlowAddressFilled) ? null : requiredError()));
      validate(schemaPath.finance, ({ value }) => (isFlowFinanceFilled(value()) ? null : requiredError()));
    },
  );

  public initApplication(application: OnlineApplication): void {
    this.flowForm().value.set({
      docPersonalLegalNo: application.borrower.docPersonalLegalNo,
      employees: application.borrower.employees,
      id: application.borrower.id,
      name: application.borrower.name,
      newEmployees: application.borrower.newEmployees,
      legalForm: application.borrower.legalForm.id,
      ownershipCode: application.borrower.ownershipCode.id,
      registrationDate: application.borrower.registrationDate,
      registrationNumber: application.borrower.registrationNumber,
      registrationPlaceCode: application.borrower.registrationPlaceCode,
      workPhone: this.authService.user()?.phone,
      email: this.authService.user()?.email,
      addresses: mergeRequiredAddresses(application.adresses ?? []),
      extraInformations: (application.extraInformations ?? []).map((item) => ({
        ...flowExtraInformationFormModel,
        ...item,
      })),
      finance: createDefaultFinanceForm(application.finData?.[0] ? mapFinDataToFlowForm(application.finData[0]) : null),
      oked: application.borrower.oked.id,
    });
  }

  public getExtraInformationsForStartProcessing(): OnlineStartProcessingExtraInformation {
    return mapFlowExtraInformationsToStartProcessing(this.flowForm().value().extraInformations);
  }

  public getFinDataForStartProcessing(): OnlineStartProcessingFinData {
    return mapFlowFinanceInformationsToStartProcessing([this.flowForm().value().finance]);
  }

  public buildStartProcessingPayload(applicationId: number): OnlineCreateApplicationPayload {
    return buildStartProcessingPayloadFromForm(this.flowForm().value(), applicationId);
  }
}
