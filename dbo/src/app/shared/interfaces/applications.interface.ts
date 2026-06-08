import {DOCUMENTS_TYPES, DOCUMENTS_TYPES2} from "../types";

export interface IApplicationFilter {
  applicationTypes: string[] | null;
  pageSize: number;
  pageNum: number;
  sender: string | null;
  receiver: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  amountFrom: number | null;
  amountTo: number | null;
  docNum: string | null;
  currency: string | null;
  searchText: string;
}

export interface AppReportParentDTO {
  value: string;
  enabled: boolean;
  description: string;
  fileTypeDescription: string | null;
  child: AppReportParentDTO[];
  fileTypeList: DOCUMENTS_TYPES2[];
}

export interface AppReportTMPParamDTO {
  id: string;
  input: string;
  items: {value: string; label: string}[];
  label: string;
  required: boolean;
}
export interface AppReportTMPDTO {
  description: string;
  output_formats: DOCUMENTS_TYPES[];
  parameters: AppReportTMPParamDTO[];
  template_id: string;
  template_name: string;
}
export interface AppReportTMPParamDTO2 {
  id: string;
  input: string;
  items: {value: string; text: string}[];
  label: string;
  required: boolean;
}
export interface AppReportTMPDTO2 {
  description: string;
  output_formats: DOCUMENTS_TYPES[];
  parameters: AppReportTMPParamDTO2[];
  template_id: string;
  template_name: string;
}

export interface DropDownDTO {
  value: string;
  label: string;
}
export interface AccountV2DTO {
  account_type: string;
  code_currency: string;
  currency_logo_url: string;
  saldo: string;
  text: string;
  value: string;
}
