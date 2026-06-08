// REQUEST

export interface KartotekaRequest {
  paging?: PagingRequest
  cardFileType?: number
  filter?: FilterRequest
}


// RESPONSE

export interface KartotekaContentResponse<T> {
  content: T[]
  paging: Pagination
  total?: TotalBalance
}


export interface KartotekaDataResponse<T> {
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
  NEW = "NEW",
  ACTIVE = "ACTIVE",
  PARTIAL_CLOSED = "PARTIAL_CLOSED",
  DELETED = "DELETED",
  RETURNED = "RETURNED",
  REJECTED = "REJECTED",
  UNKNOWN = "UNKNOWN",
}

export interface FilterRequest {
  fromDate?: string
  toDate?: string
  coName?: string
  searchText?: string
  statusList?: STATUSES[]
  fromAmount?: number
  toAmount?: number
}




export interface KartotekaOne {
  documentId: number
  dateEnter: string
  state: string
  status: STATUSES
  cardType: number
  docType: string
  docTypeName: string
  docDate: string
  docNum: string
  codeFilial: string
  coMfo: string
  coInn: string
  coName: string
  purposeCode: string
  purposeName: string
  sumDoc: number;
  sumPay: number
  datePay: string
  dayAccept: string
  sumSaldo: number
  cipherCode: string
  cipherName: string
  paymentType: string
  paymentTypeName: string
  amountPayed: number
  amountRejected: number

  clAcc: {
    accountNumber: number
    balanceAccount: number
    currency: string
  }
  coAcc: {
    accountNumber: number
    balanceAccount: number
    currency: string
  }
  buttons: actionButtons[]
}

export interface KartotekaContent {
  documentId: number
  dateEnter: string
  state: string
  status: STATUSES
  cardType: number
  docType: string
  docTypeName: string
  docDate: string
  docNum: string
  codeFilial: string
  coMfo: string
  coInn: string
  coName: string
  purposeCode: string
  purposeName: string
  sumDoc: number;
  sumPay: number
  datePay: string
  dayAccept: string
  sumSaldo: number
  cipherCode: string
  cipherName: string
  paymentType: string
  paymentTypeName: string
  clAcc: string
  coAcc: string
  buttons: actionButtons[]
}




interface actionButtons {
  name: string,
  actionType: "ACCEPT_OR_REJECT_KARTATEKA" | "PAY_KARTATEKA" | "DOWNLOAD" | "MOVE_TO_KARTATEKA2"
  statusNameFront: string
  type: "REJECT" | "ACCEPT" | null
}




// FILTER FORM

export type FilterForm = {
  searchText: string | null | undefined
  fromAmount: number | null | undefined
  toAmount: number | null | undefined
  fromDate: string | null | undefined
  toDate: string | null | undefined
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
  fileType: 'EXCEL' | 'PDF' | 'CSV'; // you can restrict or extend as needed
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


export type KartotekaTransactionsResponse = {
  transacts: KartotekaTransactions[]
}

export type KartotekaTransactions = {
  documentId: number
  operDate: string
  transactId: number
  executeTime: string
  state: string
  leadType: string
  sumPay: number
  sumSaldo: number;
}


export interface TemporaryQrPayload {
  type: "ACCEPT_OR_REJECT" | "MOVE_TO_KARTATEKA2"
  body: any
}



export interface IClientReservation {
  clientId: number;
  reserveId: number;
  operDay: string;
  period: string;
  clAcc: string;
  clientCode: string;
  clAccount: string;
  sumDoc: number;
  sumReserved: number;
  sumPaid: number;
  sumUnlead: number;
  docNum: string;
  cashSymbol: string;
  purposeName: string;
  docDate: string;
  state: string;
  stateName: string;
  branchId: number;
  localCode: string;
  clName: string;
  saldoObAcc: number;
  sumCard2: number;
  BronToPay: number;
  SumNeed: number;
}


export interface ClientReservationNeeds {
  clientId: number;
  clientCode: string;
  clAcc: string;
  clName: string;
  docNum: string;
  dateAct: string;       // consider Date if you parse it
  dateDeact: string;     // consider Date if you parse it
  dateCorrect: string;   // consider Date if you parse it
  sumNeed: number;
  sumNeedPay: number;
  sumNeedPaid: number;
  issue: number;
  sumNeedDay: number;
  sumNeedUnl: number;
  cashSym: string;
  payPurpose: string;
  state: string;
  stateName: string;
  neotlId: number;
  branchId: number;
  localCode: string;
  clAccFull: string;
}

export interface IMoveToKartoteka2Response {
    card2Id: string;
    cardId: string;
    errorCode: string;
    errorMsg: string;
}


export interface EPTListResponse {
  content: TransactionContent[];
  paging: Pagination;
}



export interface TransactionContent {
  id: string;
  eptId: number;
  documentId: string;
  isAccept: string;
  recallId: string;
  creditorId: string;

  docNumber: number;
  docDate: string;
  summa: {
    amount: number
    scale: number
    currency: string
  };

  payerBank: string;
  payerBranch: string;
  payerAccount: string;
  payerInn: string;
  payerName: string;

  payeeBank: string;
  payeeBranch: string;
  payeeAccount: string;
  payeeInn: string;
  payeeName: string;

  paymenType: string;
  unpaid: string;

  purposeCode: string;
  purpose: string;

  sumUnlead: number;
  sumRecall: number;
  sumPaid: number;
  sumRest: number;
  sumIgnore: number;

  stateId: number;
  status: string;
  errorCode: string;

  isNew: boolean;
  source: string;

  transactionId: number;
  transactionUuid: string;

  statusNameFront: string;

  signedList: SignedUser[];
  buttons: TransactionButton[];

  transactionMode: TransactionMode;
}

export interface SignedUser {
  fullName: string;
  signDate: string;
  roleType: string;
  signOrderNumber: number;
  isFinished: boolean;
  status: string;
}

export interface TransactionButton {
  name: string;
  actionType: ActionType;
  statusNameFront: string;
  type: ButtonType;
}



export type TransactionMode = "DEFAULT" | string;

export type ActionType =
| "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RECALL"
  | string;

export type ButtonType =
  | "ACCEPT"
  | "REJECT"
  | "MOVE"
  | string;



export interface EPTFilterRequest {
  clientId?: string;
  search?: string;
  isFilter?: boolean;
  isForNotification?: boolean;

  direction?: string;

  summa?: string;
  docDate?: string;
  docNumber?: string;

  payeeAccount?: string;
  payeeBranch?: string;

  additionalTemplate?: string;
  status?: string;

  page?: number;
  size?: number;
}
