import { TransactionTypes } from '../../../../../core/models/transaction.models';
import { Balance } from "../../../../../core/models/backend-response.model";



export interface TransactionStatusItem{
    code:     string;
    uzbTitle: string;
    rusTitle: string;
    engTitle: string;
    kaaTitle: string;
    logo:     string;
}



export interface AccountsList {
  content: AccountsDto[];
  totalElements: number;
  number: number;
  size: number;
  pageable: pageable
}
export interface AccountPinListDto {
  accounts: AccountsDto[];
  totalElements: number;
  number: number;
  size: number;
}

export interface CodePurposeContent {
  readonly code: string;
  readonly name: string
}

export interface TCodePurpose {
  readonly content: CodePurposeContent[];
  readonly totalElements: number;
}

export interface BannerList {
  content: BannerDto[];
  totalElements: number
}

export type AccountInfoDto = {
  accountNumberCard: string
  holderInfo: string
  balance: {
    amount: number,
    scale: number,
    currency: string,
    logo: any,
  }
  active: boolean,
  inn: string,
  mfo: string,
  accountType: string;
  onlineActualBal: number;
  accountTitle: string;
  accountTitle1: string;
  openDate: string;
  altAcctId: string;
  id: number;
  currency: string;
  qr?: string;
  filialName?: string
}

export interface TransactionListDto {
  content: TransactionContent[];
  totalElements: number
  totalPages: number
  pageable: pageable
  totalSum?: number
}

export interface MunisCategoryListDto {
  readonly hasTechnicalWorks: boolean;
  readonly id: string;
  readonly logo: {
    name: string,
    path: string;
  };
  readonly title: string;
  readonly type: string;
}

export interface MunisListItem {
  id: string;
  uuid: string;
  name: string;
  expenseCurrentMonth: Amount;
  expenseLastMonth: Amount;
  hasDebt: boolean;
}

export interface OfficeServiceRes {
  content: OfficeServices[],
  pageable: pageable
  totalElements: number
  totalPages: number
}

export interface OfficeServices {
  id :string;
  balance: Amount
  myOfficeId: string;
  parentService: ServiceDTO,
  service: ServiceDTO
}

export interface ServiceDTO {
  id: string;
  merchant: string;
  title: string;
  logo: Logo;
  minAmount: Amount;
  amount: Amount;
  suggestedAmounts: MoneyAmount[];
  maxAmount: Amount;
  editable: boolean;
  hasInfo: boolean;
  hasChild: boolean;
  params: ServiceParam[];
  childServices: ServiceItem[];
}

export interface MunisCreatePayload {
  senderAccount: string;
  docDate: string;
  docNum: string;
  description: string;
  amount: {
    amount: number,
    scale: number,
    currency: string
  },
  recipientId: string;
  params: {
    id: string,
    value: string,
    prefix?: string,
    suffix?: string
  }[];
  isAutoPay?: boolean,
  autoPayCreateReq?: any;
}

export interface PaymentParam {
  title: string;
  id: string;
  value: string;
  mask: string | null;
  options: any[] | null;
  type: 'STRING' | 'SELECT' | 'INTEGER' | 'PHONE' | 'MONEY';
}

export interface MoneyAmount {
  amount: number;
  scale: number;
  currency: string;
  logo: string | null;
}

export interface CheckServicePayload {
  params: PaymentParam[];

  commissionAmount: MoneyAmount;
  payAmount: MoneyAmount;
  amount: MoneyAmount;

  purpose: string;

  suggestedAmounts: MoneyAmount[];
}

export interface ServiceItem {
  id: string;
  merchant: string;
  title: string;
  editable: boolean;
  hasChild: boolean;
  hasInfo: boolean;
  childServices: ServiceItem[];
  logo: Logo;
  minAmount: Amount;
  maxAmount: Amount;
  params: ServiceParam[];
}

export interface Amount {
  amount: number;
  scale: number;
  currency: string;
}

export interface Logo {
  contentType: string;
  path: string;
  name: string;
  ext: string;
}

export interface Amount {
  amount: number;
  scale: number;
  currency: string;
  logo: Logo;
}

export interface ServiceParam {
  id: string;
  title: string;
  required: boolean;
  readOnly: boolean;
  mask: string;
  placeholder: string;
  type: string;
  bind: string;
  prefix: string[];
  suffix: string[];
  value: string;
  isMain: boolean;
  selectValue: SelectValue[];
}

export interface SelectValue {
  title: string;
  value: string;
}

export interface TemplateContentList {
  externalId: string | null
  id: string;
  name: string;
  recipientAccount: string;
  recipientName: string;
  senderAccount: string;
  senderName: string;
}

export interface TemplateList {
  content: TemplateContentList[];
  totalElements: number
  totalPages: number
  paging: pageable
}

export type TransactionContent = {
  purposeCode?:any;
  purposeName?:any;
  name?: string
  docNum: string;
  canUserSign: boolean;
  fromAbs: boolean;
  pin: boolean;
  audit: {
    "createdBy": string,
    "createdByName": string;
    "updatedBy": string;
    "updatedByName": string;
    "createdAt": string
    "updatedAt": string
  }
  saldo: {
    amount: number
    scale: number
    currency: string
  },
  sender: {
    pinfl: number
    codeFilial: number | null
    name: string
    tax: number
    account: string
  },
  purpose: {
    code: number
    purposeCode: number
    name: string
  },
  recipient: {
    pinfl: number
    codeFilial: number
    name: string
    tax: number
    account: string
    icon: any;
  },
  receiverAmount: {
    amount: number
    scale: number
    currency: string
  }
  senderAmount: {
    amount: number
    scale: number
    currency: string
  }
  externalId: string
  docDate: string;
  description: string
  senderLogo: string;
  absStatus: string
  isSigned: boolean
  status: string
  signedList: Array<{
    username: string;
    signDate: string | null
    isSigned: boolean;
    roleType: string;
  }>;
  type: string
  isDebit: boolean
  transactionMode: TransactionTypes;
  additionalInfo: null | {
    name: null | string,
    cardNumberUnmasked: string,
    month: string,
    year: string,
    contractNumber: string,
    parentId: string,
    expiryDate: string,
    windowType: string,
    description: string,
    transitAccount: string
    loanId?:string
  },
  id: string,
  statusNameFront?: string,
  statusLogo?: any,
  transactionId: number,
  buttons: any[],
  paymentCode: number | null,
  createdDate: string,
}

export interface AccountsDto {
  account?: string;
  codeFilial?: string;
  accBlockReason?: string;
  codeCurrency?: string;
  condition?: string
  accBlockDate?:string;
  name: string;
  accBlockDetails?:string;
  stateLogo?: {
    name: string,
    path: string;
  }
  balance: {
    amount: number;
    scale: number;
    currency: string;
    logo?: {
      name: string,
      path: string;
    }
  };
  depSaldo: {
    amount: number;
    scale: number;
    currency: string;
    logo?: {
      name: string,
      path: string;
    }
  };
  saldo?: {
    amount: number;
    scale: number;
    currency: string;
  },
  currency?:{
    currency?: string,
    logo?: {
      contentType?: null,
      path?: string,
      name?:string,
      ext?: null
    }
  },
  nameAcc?: string;
  onlineActualBal: number;
  accountTitle: string;
  accountTitle1: string;
  accountType: string;
  openDate: string;
  altAcctId: string;
  id: number;
  status?: string;
  hasPinned?: boolean
  pinnedOrder?: number
  mfo?: string;
}

export interface BannerDto {
  id: string
  title: string,
  description: string,
  contentURL: string,
  bannerCollection: 0,
  attachmentId: string
  attachmentURL: string

}

export interface pageable {
  sort: {
    empty: boolean,
    unsorted: boolean,
    sorted: boolean
  },
  offset: number,
  pageNumber: number,
  pageSize: number,
  paged: boolean,
  unpaged: boolean,
  totalItems: number
  totalPages: number

}

export type PurposeContent = {
  code: string
  name: string
  purposeCode: string
}

export type BudgetAccountReferenceDto = {
  content: BudgetReferenceContentDto[]
  totalElements: number
  totalPages: number
  pageable: pageable
  number: number
}

export type BudgetReferenceContentDto = {
  id: number
  recipientAccountNumber: string
  recipientName: string
  branchCode: string
  inn: string
  incomeTypeCode: string
  soatoDistrictCode: string
  balanceAccount: string
  uns: string
  transitBankAccount: string
  activationDate: string
  deactivationDate: string
  status: string
  referenceId: string,
  regionName: string,
  districtName: string,
  soatoDetail: {
    regionCode: string;
    regionName: string;
    districtName: string;
  }

  account: string;
  codeCurrency: string | null
  codeFilial: string
  condition: string
  filialName: string;
  nameAcc: string;
  typeAccount: string
}

export enum accountOrderEnum {
  ACCOUNT_TYPE = 'ACCOUNT_TYPE',
  ACCOUNT_NUMBER = 'ACCOUNT_NUMBER',
  CURRENCY = 'CURRENCY',
  BALANCE = 'BALANCE',
  PROCESS_BALANCE = 'PROCESS_BALANCE',
  STATUS = 'STATUS',
}

export type DailyTransaction = {
  account: string
  date: string
  totalDebit: Balance
  totalCredit: Balance
  amountBegin: Balance
  amountEnd: Balance

}
