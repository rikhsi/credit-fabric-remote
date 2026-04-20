import { Injectable } from '@angular/core';
import { form, max, min, required } from '@angular/forms/signals';
import { agreementFormModel, calculatorFormModel } from '../data';

@Injectable()
export class LoanDetailService {
  public readonly calculatorForm = form(calculatorFormModel, (schemaPath) => {
    min(schemaPath.amount, 10000000);
    max(schemaPath.amount, 100000000);
    min(schemaPath.term, 18);
    max(schemaPath.term, 36);
  });

  public readonly agreementForm = form(agreementFormModel, (schemaPath) => {
    required(schemaPath.offer);
  });
}
