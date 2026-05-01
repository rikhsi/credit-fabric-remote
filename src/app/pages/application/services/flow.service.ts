import { Injectable, signal } from '@angular/core';
import { form, minLength, required } from '@angular/forms/signals';
import { flowFormModel } from '../data';

@Injectable()
export class FlowService {
  public readonly flowForm = form(signal(flowFormModel), (schemaPath) => {
    required(schemaPath.oked);
    required(schemaPath.workerAmount);
    required(schemaPath.workerNewAmount);
    required(schemaPath.addresses);
    required(schemaPath.extraInformations);
    required(schemaPath.cardNumber);
    minLength(schemaPath.addresses, 1);
    minLength(schemaPath.extraInformations, 1);
  });
}
