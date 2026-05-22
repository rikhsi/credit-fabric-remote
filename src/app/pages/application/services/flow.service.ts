import { Injectable, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { flowAdressFormModel, flowFormModel } from '../data';
import { OnlineApplication } from '@api/models/los';

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
    required(schemaPath.addresses);
    required(schemaPath.extraInformations);
    required(schemaPath.financeInformations);
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
      addresses: (application.adresses ?? []).map((item) => ({
        ...flowAdressFormModel,
        ...item,
      })),
      extraInformations: [],
      financeInformations: [],
      oked: application.borrower.oked.id,
    });
  }
}
