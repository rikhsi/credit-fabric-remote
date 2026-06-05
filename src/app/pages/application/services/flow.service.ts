import { inject, Injectable, signal } from '@angular/core';
import { form, maxLength, minLength, required, requiredError, validate } from '@angular/forms/signals';
import { buildRequiredAddresses, isFlowAddressFilled } from '../utils/address';
import { createDefaultFinanceForm } from '../utils/finance-months';
import { OnlineApplication, OnlineCreateApplicationPayload } from '@api/models/los/online';
import { AuthService } from '@core/services/auth.service';

@Injectable()
export class FlowService {
  private authService = inject(AuthService);
  private initializedApplicationId: number | null = null;

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
      extraInformation: {
        sectorEconomy: null,
        objectNewFormation: null,
        enterpriseClassfier: null,
        ecologicalImpactCode: null,
      },
      addresses: buildRequiredAddresses(),
      finData: createDefaultFinanceForm(),
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
      required(schemaPath.extraInformation.sectorEconomy);
      required(schemaPath.extraInformation.ecologicalImpactCode);
      required(schemaPath.extraInformation.enterpriseClassfier);
      required(schemaPath.extraInformation.objectNewFormation);
      required(schemaPath.finData.activityTerm);
      required(schemaPath.finData.dirCompanyActivityId);
      required(schemaPath.finData.month1Income);
      required(schemaPath.finData.month1Revenue);
      required(schemaPath.finData.month2Income);
      required(schemaPath.finData.month2Revenue);
      required(schemaPath.finData.month3Income);
      required(schemaPath.finData.month3Revenue);
      required(schemaPath.finData.sysMonth1Id);
      required(schemaPath.finData.sysMonth2Id);
      required(schemaPath.finData.sysMonth3Id);
      minLength(schemaPath.docPersonalLegalNo, 14);
      maxLength(schemaPath.docPersonalLegalNo, 14);
      validate(schemaPath.addresses, ({ value }) => (value().every(isFlowAddressFilled) ? null : requiredError()));
    },
  );

  public initApplication(application: OnlineApplication, applicationId: number | string): void {
    const id = Number(applicationId);

    if (this.initializedApplicationId === id) {
      return;
    }

    this.initializedApplicationId = id;

    this.flowForm().value.set({
      applicationId: id,
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
      addresses: buildRequiredAddresses(),
      extraInformation: {
        sectorEconomy: null,
        objectNewFormation: null,
        enterpriseClassfier: null,
        ecologicalImpactCode: null,
      },
      finData: createDefaultFinanceForm(),
      oked: application.borrower.oked.id,
    });
  }
}
