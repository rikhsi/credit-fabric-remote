import { FlowAddressForm, FlowExtraInformationForm, FlowForm } from '../models';

export const flowFormModel: FlowForm = {
  oked: null,
  workerAmount: null,
  workerNewAmount: null,
  cardNumber: null,
  extraInformations: [],
  addresses: [],
};

export const flowExtraInformationFormModel: FlowExtraInformationForm = {
  sectorEconomy: null,
  objectNewFormation: null,
  enterpriseClassifier: null,
  ecologicalImpactCode: null,
};

export const flowAdressFormModel: FlowAddressForm = {
  addressType: null,
  city: null,
  address: null,
  street: null,
  postalCode: null,
};
