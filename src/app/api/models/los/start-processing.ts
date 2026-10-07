export interface StartProcessingFinData {
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
  monthYear1: string;
  monthYear2: string;
  monthYear3: string;
}

export interface StartProcessingAddress {
  dirCountryId: string;
  dirCityId: string;
  dirVillageId: string;
  street: string;
  zipCode: string;
}

export interface StartProcessingContact {
  firstName: string;
  lastName: string;
  /** Digits only, country code included: `998990031497`. */
  mobilePhone: string;
  dirFamilyRelationshipId: string;
}

export interface StartProcessingPayload {
  productId: string;
  loanAmount: number;
  loanTerm: number;
  sysPaymentTypeId: string;
  filialCode: number;
  /** Digits only, country code included: `998990031497`. */
  mobilePhone: string;
  addresses: StartProcessingAddress;
  contacts: StartProcessingContact[];
  finData: StartProcessingFinData;
}

export interface StartProcessingResult {
  is_show_toastr: boolean;
  statusCode: string;
  statusDesc: string;
  statusTitle: string;
}
