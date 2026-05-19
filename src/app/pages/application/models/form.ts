export interface FlowForm {
  name: string;
  ownership: number;
  registrationDate: Date;
  pinfl: string;
  registrationNumber: string;
  registrationAuthority: number;
  legalForm: number;
  oked: number;
  workerAmount: number;
  workerNewAmount: number;
  cardNumber: number;
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
