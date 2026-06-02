export interface FlowForm {
  docPersonalLegalNo: string;
  email: string;
  employees: number;
  id: number;
  name: string;
  newEmployees: number;
  legalForm: number;
  oked: number;
  ownershipCode: number;
  registrationDate: Date;
  registrationNumber: string;
  registrationPlaceCode: string;
  workPhone: string;
  extraInformations: FlowExtraInformationForm[];
  addresses: FlowAddressForm[];
  financeInformations: FlowFinanceForm[];
}

export interface FlowExtraInformationForm {
  sectorEconomy: number;
  objectNewFormation: number;
  enterpriseClassifier: number;
  ecologicalImpactCode: number;
}

export interface FlowAddressForm {
  addressType: string;
  city: number;
  address: string;
  street: number;
  postalCode: string;
}

export interface FlowFinanceForm {
  companyActivity: number;
  activityTerm: string;
  month1: number;
  month1Revenue: string;
  month1Income: string;
  month2: number;
  month2Revenue: string;
  month2Income: string;
  month3: number;
  month3Revenue: string;
  month3Income: string;
}
