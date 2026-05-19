import { FlowAddressForm, FlowExtraInformationForm, FlowForm } from '../models';

export const flowFormModel: FlowForm = {
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
