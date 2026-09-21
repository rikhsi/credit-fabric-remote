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
  dirCityId: string;
  dirVillageId: string;
  street: string;
  zipCode: string;
}

export interface StartProcessingPayload {
  loanAmount: number;
  loanTerm: number;
  sysPaymentTypeId: string;
  filialCode: number;
  addresses: StartProcessingAddress[];
  finData: StartProcessingFinData;
}

export interface StartProcessingResult {
  is_show_toastr: boolean;
  statusCode: string;
  statusDesc: string;
  statusTitle: string;
}
