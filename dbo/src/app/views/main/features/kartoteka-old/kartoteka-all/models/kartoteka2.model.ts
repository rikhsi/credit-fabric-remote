                                                             // REQUEST 

export interface Kartoteka2Request {
  paging?: PagingRequest
  cardFileType?: number | null
  filter?: FilterRequest
}


                                                             // RESPONSE

export interface Kartoteka2ContentResponse {
  content: Kartoteka2Content[]
  paging: Pagination
  total?: TotalBalance
}


export interface Kartoteka2DataResponse<T> {
  data: T
}


                                                         // Response Helpers
export interface Pagination {
  pageNumber: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export interface TotalBalance {
  amount: number
  currency: string
  scale: number
}


                                                           // REQUEST HELPERS

export interface PagingRequest {
  page?: number
  size?: number
}



export enum STATUSES {
  ACTIVE = "ACTIVE",
  PARTIAL_CLOSED = "PARTIAL_CLOSED",
  DELETED = "DELETED",
  UNKNOWN = "UNKNOWN",
}

export interface FilterRequest {
  fromDate?: string
  toDate?: string
  coName?: string
  searchText?: string
  statusList?: STATUSES[]
  fromAmount?: number
  toAmount?:number
}


                                                           // REQUEST HELPERS
export interface Kartoteka2Content {
  cardType: number
  cipherCode: string
  cipherName: string
  clAcc: string
  coAcc: string
  coInn: string
  coMfo: string
  coName: string
  codeFilial: string
  dateEnter: string
  datePay: string
  dayAccept: string
  docDate: string
  docNum: string
  docType: string
  documentId: number
  paymentType: string
  paymentTypeName: string
  purposeCode: string
  purposeName: string
  state: string
  status: STATUSES
  sumDoc: number;
  sumPay: number
  sumSaldo: number
}


                                                             // FILTER FORM

export type FilterForm = {
  searchText: string | null | undefined
  fromAmount: number | null  | undefined
  toAmount: number | null  | undefined
  fromDate: string | null  | undefined
  toDate: string | null  | undefined
  coName: string | null | undefined
  statusList: STATUSES[] | null | undefined
};

export type FilterKeys = keyof FilterForm | "recipient";


export interface StatusListMap extends Record<STATUSES, string> {
  [STATUSES.ACTIVE]: string;
  [STATUSES.PARTIAL_CLOSED]: string;
  [STATUSES.DELETED]: string;
  [STATUSES.UNKNOWN]: string;
} 

export interface StatusListResponseData {
  statusList: StatusListMap;
}


export interface FileRequest {
  cardFileType?: number | null;
  filter?: FileFilter;
  fileType: 'EXCEL' | 'PDF' | 'CSV' ; // you can restrict or extend as needed
}

export interface FileFilter {
  fromDate?: string;       // format: DD.MM.YYYY
  toDate?: string;         // format: DD.MM.YYYY
  coName?: string;
  searchText?: string;
  statusList?: string[];   
  fromAmount?: number;
  toAmount?: number;
}