import { TransactionMode } from "src/app/shared/models/transaction-mode.model";

export interface GetAllowedAccountsRequest {
  size: number;
  page: number;
  senderAccount?: string;
  transactionMode: TransactionMode;
  accountType?: string;
  currency?: string;
  search?: string;
}

export interface AccountsPageResponse {
  content: AccountResponse[];
  pageable: {
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  first: boolean;
  empty: boolean;
}

export interface AccountResponse {
  balance: {
    amount: number;
    scale: number;
    currency: string;
    logo: {
      contentType: string | null;
      path: string;
      name: string;
      ext: string | null;
    };
  };
  accountTitle: string;
  openDate: string;
  altAcctId: string;
  status: string;
  id: string;
  saldoUnlead: number | null;
  isMain: boolean;
  isTransactionAllowed: boolean;
  accountType: string;
  paymentSource: boolean
}

export interface AccountInfoResponse {
  id: number;
  accountNumberCard: string;
  holderInfo: string;
  balance: {
    amount: number;
    scale: number;
    currency: string;
    logo: {
      contentType: string | null;
      path: string;
      name: string;
      ext: string | null;
    };
  };
  mfo: string;
  filialName: string;
  inn: string;
  openDate: string;
  accountType: string;
  accountTitle: string;
  active: boolean;
}

export interface DocNumResponse {
  msg: string;
}

export interface DictionaryResponse {
  key: string;
  value: string;
}

export interface ListDictionaryResponse {
  content: DictionaryResponse[];
  totalElements: number;
}
