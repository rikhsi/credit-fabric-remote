export interface OnlineStartProcessingExtraInformation {
  ecologicalImpactCode: string;
  enterpriseClassfier: string;
  objectNewFormation: string;
  sectorEconomy: string;
}

export interface OnlineStartProcessingFinData {
  dirCompanyActivityId: string;
  activityTerm: number;
  sysMonth1Id: string;
  sysMonth2Id: string;
  sysMonth3Id: string;
  month1Revenue: number;
  month1Income: number;
  month2Revenue: number;
  month2Income: number;
  month3Revenue: number;
  month3Income: number;
  monthYear1: number;
  monthYear2: number;
  monthYear3: number;
}

export interface OnlineStartProcessingAddress {
  sysAddressTypeId: string;
  dirCityId: string;
  dirVillageId: string;
  street: string;
  zipCode: string;
  dirCountryId: string;
}

export interface OnlineCreateApplicationPayload {
  addresses: OnlineStartProcessingAddress[];
  applicationId: number;
  docPersonalLegalNo: string;
  email: string;
  employees: number;
  extraInformation: OnlineStartProcessingExtraInformation;
  finData: OnlineStartProcessingFinData;
  legalForm: string;
  name: string;
  newEmployees: number;
  oked: string;
  ownershipCode: string;
  registrationDate: Date;
  registrationNumber: string;
  registrationPlaceCode: string;
  workPhone: string;
}

export interface OnlineCreateApplicationResult {
  is_show_toastr: boolean;
  statusCode: string;
  statusDesc: string;
  statusTitle: string;
}
