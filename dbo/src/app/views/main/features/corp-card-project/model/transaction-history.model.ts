
export interface CurrencyInfo {
  amount: number;
  scale: number;
  currency: string;
  logo: string | null;
}

export interface SignedItem {
  fullName: string;
  signDate: string;
  roleType: string;
  signOrderNumber: number;
  isFinished: boolean;
  status: string;
}

export interface ButtonItem {
  name: string;
  actionType: string;
  statusNameFront: string;
}

export interface StatusLogo {
  contentType: string;
  path: string;
  name: string;
  ext: string;
}

export interface CardTransaction {
  id: string;
  panMask: string;
  pan:string;
  date: string;
  time: string;
  terminalId?:string;
  hasTerminalId?:boolean
  amount: CurrencyInfo;
  commission: CurrencyInfo;
  operationType: string;
  reversal: boolean;
  merchantName: string;
  purpose: string;
  address: string;
  isCredit: boolean;
  refNum: string;
  activeBalanceMir: CurrencyInfo;
  activeBalanceUz: CurrencyInfo;
  status: string;
  processing: string;
  statusNameFront: string;
  signedList: SignedItem[];
  buttons: ButtonItem[];
  statusLogo: StatusLogo;
  canUserSign: boolean;
  docNum: string;
  description: string;
}



export interface Paging {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface PagingResponse {
  content: CardTransaction[];
  paging: Paging;
}

export interface CorpCardTransactionResponse {
  pagingResponse: PagingResponse;
  totalDebit: number;
  totalCredit: number;
  signPrepareCount: number;
}

export type CorpCardTransactionList = [string, CardTransaction[]][];


// PAYLOAD INTERFACE

export interface TransactionFilterRequest {
  uuid?: string;
  startDate?: string;  // format: YYYY-MM-DD
  endDate?: string;    // format: YYYY-MM-DD
  paging?: PagingFilter;
  isCredit?: number;   // 0, 1, or 2 maybe?
  searchText?: string;
  fromAmount?: number;
  toAmount?: number;
  status?: string;
  isSignable?: boolean;
}

export interface PagingFilter {
  page?: number;
  size?: number;
}

