import { inject, Injectable, signal } from '@angular/core';
import { form, maxLength, minLength, required, requiredError, validate } from '@angular/forms/signals';
import { isFlowFinanceFilled } from '../utils/finance';
import { isFlowAddressFilled } from '../utils/address';
import { OnlineApplication, OnlineCreateApplicationPayload } from '@api/models/los/online';
import { AuthService } from '@core/services/auth.service';

@Injectable()
export class FlowService {
  private authService = inject(AuthService);

  public readonly flowForm = form(
    signal<OnlineCreateApplicationPayload>({
      name: null,
      applicationId: null,
      ownershipCode: null,
      registrationDate: null,
      docPersonalLegalNo: null,
      email: null,
      employees: null,
      newEmployees: null,
      legalForm: null,
      oked: null,
      registrationNumber: null,
      registrationPlaceCode: null,
      workPhone: null,
      extraInformation: null,
      addresses: [],
      finData: null,
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
      required(schemaPath.name);
      minLength(schemaPath.docPersonalLegalNo, 14);
      maxLength(schemaPath.docPersonalLegalNo, 14);

      validate(schemaPath.addresses, ({ value }) => (value().every(isFlowAddressFilled) ? null : requiredError()));
      validate(schemaPath.finData, ({ value }) => (isFlowFinanceFilled(value()) ? null : requiredError()));
    },
  );

  public initApplication(application: OnlineApplication, applicationId: number): void {
    this.flowForm().value.set({
      applicationId,
      docPersonalLegalNo: application.borrower.docPersonalLegalNo,
      employees: application.borrower.employees,
      name: application.borrower.name,
      newEmployees: application.borrower.newEmployees,
      legalForm: application.borrower.legalForm.id,
      ownershipCode: application.borrower.ownershipCode.id,
      registrationDate: application.borrower.registrationDate,
      registrationNumber: application.borrower.registrationNumber,
      registrationPlaceCode: application.borrower.registrationPlaceCode,
      workPhone: this.authService.user()?.phone,
      email: this.authService.user()?.email,
      addresses: [],
      extraInformation: null,
      finData: null,
      oked: application.borrower.oked.id,
    });
  }
}
