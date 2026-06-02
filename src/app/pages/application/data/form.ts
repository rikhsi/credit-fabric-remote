import { buildRequiredAddresses } from '../constants/address-type';
import { FlowForm, FlowExtraInformationForm, FlowAddressForm, FlowFinanceForm } from '../models/form';

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
  addresses: buildRequiredAddresses(),
  financeInformations: [],
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

export const flowFinanceFormModel: FlowFinanceForm = {
  companyActivity: null,
  activityTerm: null,
  month1: null,
  month1Revenue: null,
  month1Income: null,
  month2: null,
  month2Revenue: null,
  month2Income: null,
  month3: null,
  month3Revenue: null,
  month3Income: null,
};
