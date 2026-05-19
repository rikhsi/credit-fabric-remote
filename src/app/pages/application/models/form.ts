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
}

export interface FlowExtraInformationForm {
  sectorEconomy: number;
  objectNewFormation: number;
  enterpriseClassifier: number;
  ecologicalImpactCode: number;
}

export interface FlowAddressForm {
  addressType: number;
  city: number;
  address: string;
  street: number;
  postalCode: string;
}
