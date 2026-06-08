import {Balance} from "../../../../../core/models/backend-response.model";

export interface PageRequestWIthUpdate {
  paging: {
    page: number;
    size: number;
  };
}

export type PageRequestWIthDate = {

  uuid: string | null
  startDate: string | null
  endDate: string | null
  paging: {
    page: number
    size: number
  },
  isCredit: number
}

export type CorpCardListDto = {
  content: CorpCardListContent[]
  totalElements: number
}

export type CorpCardBalanceDto = {
  cardType: string[]
  totalAmount: {
    amount: number
    scale: number
    currency: string
  }

}
export type CorpCardListContent = {
  id: string
  cardId: string
  pan: string
  hash: null,
  account:string
  balance: Balance
  name: string,
  isActive: string
  status: string
}

export type RequisiteCorpCarDto = {
  panMasked: string
  account: string
  ownerName: string
  cardService: string
}
export type CorpCardTransactionDto = {
  content: CorpCardTransactionContent[]
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  pageable: string
  size: number
  sort: { empty: boolean, unsorted: boolean, sorted: boolean }
  totalElements: number
  totalPages: number
}

export type CorpCardTransactionContent = {
  pan: string
  time: string
  date: string
  amount: number
  commission: number
  operationType: string
  amountScale: {
    amount: number
    scale: number
    currency: string
  },
  amountNetScale: null | {
    amount: number
    scale: number
    currency: string
  }
  info: string | null
  reversal: boolean
  terminal: string | null,
  merchantName: string
  street: string | null,
  city: string
  isCredit: boolean
  credit: boolean
  codeOperation: number | null
  currency: string
  activeBalanceMir: number
  activeBalanceUz: number

}
