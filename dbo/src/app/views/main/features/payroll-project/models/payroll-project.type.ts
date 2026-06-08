import {pageable} from "../../accounts-payments/models/accounts-payments.model";

export type PayrollProjectRequestToListDtoAll = {
  cardUuid?: string
  page?: number
  size?: number
  type?: string
  status?: string
  userType?: string
  updateBalance?: boolean
  currency?: string
  transitAccount?: string
  contractNumber?: string
}

export type PayrollProjectResponseListDtoAll = {
  totalElements: number
  totalPages: number
  number:number
  size: number
  pageable: pageable
  cards:PayrollProjectResponseContent[]
  content:PayrollProjectResponseContent []
}

export type PayrollProjectGroupResponseListDtoAll = {
  totalElements: number
  totalPages: number
  number:number
  size: number
  pageable: pageable
  content:PayrollProjectResponseGroupContent []
}

export type PayrollProjectResponseContent = {
  uuid: string
  title:string
  pan: string
  statusName:string
  accBlockDetails?:string;
  accBlockDate?:string;
  accBlockReason?:string;
  bankBranchName:string | null;
  balance: {
    amount: number
    scale:number
    currency: string
    logo: string
  }
  cardName: string
  account: string
  logo: string
  ownerName: string
  status: string
  type: string
  ownerType: string
  showBalance: boolean
  transitAccount: string
  expiryDate: string
  maskedPan: string
  contractNumber: string
  hasPinned:boolean
  pinOrder:number
}
export  type PayrollProjectResponseGroupContent = {
  transitAccount: string
  contractNumber: string
  logo: string
  type: string
  count: number
  currency:string
}

export type KeyValue = {
  key:string,
  value: string
}
