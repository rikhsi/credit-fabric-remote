export interface FlowForm {
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
