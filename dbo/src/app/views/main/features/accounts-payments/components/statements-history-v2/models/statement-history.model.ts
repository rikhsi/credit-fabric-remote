import { ReportType } from "./report.model";

// =================== Report File Type ===================
export enum ReportFileTypeEnum {
  EXCEL = 'EXCEL',
  PDF = 'PDF'
}

export const ReportFileTypeEnumRu: Record<ReportFileTypeEnum, string> = {
  [ReportFileTypeEnum.EXCEL]: 'Excel',
  [ReportFileTypeEnum.PDF]: 'PDF',
};

export type ReportFileType = keyof typeof ReportFileTypeEnum;



// =================== END OF Report File Type ===================

// =================== Report Frequency Enum ===================
export enum ReportFrequencyEnum {
  ONE_TIME = 'ONE_TIME',
  REGULAR = 'REGULAR',
}

// export const ReportFrequencyEnumRu: Record<ReportFrequencyEnum, string> = {
//   [ReportFrequencyEnum.ONE_TIME]: 'Одноразовый',
//   [ReportFrequencyEnum.REGULAR]: 'Регулярный',
// };
export const ReportFrequencyEnumRu: Record<ReportFrequencyEnum, string> = {
  [ReportFrequencyEnum.ONE_TIME]: 'accountStatements.one_time_statement',
  [ReportFrequencyEnum.REGULAR]: 'new.regular',
};


export type ReportFrequencyEnumKey = keyof typeof ReportFrequencyEnum;
// =================== END OF Report Frequency Enum ===================

// =================== Transaction Step Filter ===================
export enum TransactionStepFilter {
  ALL,
  SIGN,
  WORKING,
  CHANGE
}

export const TransactionStepFilterRu: Record<TransactionStepFilter, string> = {
  [TransactionStepFilter.ALL]: 'Все',
  [TransactionStepFilter.SIGN]: 'На подписи',
  [TransactionStepFilter.WORKING]: 'В работе',
  [TransactionStepFilter.CHANGE]: 'Изменено',
};

export type TransactionStepFilterType = keyof typeof TransactionStepFilter;
// =================== END  OF Transaction Step Filter ===================

//  =================== STATUS Type ===================
export enum StatusEnum {
  NEW = 'NEW',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export type StatusEnumType = keyof typeof StatusEnum;
export const StatusFilterRu: Record<StatusEnum, string> = {
  [StatusEnum.NEW]: 'salaryStatements.in_progress',
  [StatusEnum.COMPLETED]: 'accountStatements.issued',
  [StatusEnum.CANCELED]: 'accountStatements.error',
};

export const STATUS_OPTIONS = [
  { label:  'salaryStatements.in_progress',  value: StatusEnum.NEW },
  { label: 'accountStatements.issued', value: StatusEnum.COMPLETED },
  { label: 'accountStatements.error', value: StatusEnum.CANCELED },
];


//  =================== END OF Report Type ===================

// =================== Report Type ===================

// export enum ReportType {
//   REPORT = 'REPORT',
//   REPORT_INFO = 'REPORT_INFO',
//   ACCOUNT_ACTIVITY_INFO = 'ACCOUNT_ACTIVITY_INFO',
//   WITH_CORRESPONDENT = 'WITH_CORRESPONDENT',
//   OPERATING_DAY = 'OPERATING_DAY',
//   PERSONAL_ACCOUNT_STATEMENT = 'PERSONAL_ACCOUNT_STATEMENT',
//   DOCUMENT_STATEMENT = 'DOCUMENT_STATEMENT',
//   TERMINAL_STATEMENT = 'TERMINAL_STATEMENT',
//   CURRENCY_OPERATIONS_STATEMENT = 'CURRENCY_OPERATIONS_STATEMENT',
//   PAYMENT_DOCUMENTS = 'PAYMENT_DOCUMENTS',
//   ACCOUNT_ACTIVITY_CERTIFICATE = 'ACCOUNT_ACTIVITY_CERTIFICATE',
//   FIVE_DIGIT_ACCOUNT_CERTIFICATE = 'FIVE_DIGIT_ACCOUNT_CERTIFICATE',
//   BANK_STATEMENT_1C = 'BANK_STATEMENT_1C',
//   BANK_STATEMENT_MT940 = 'BANK_STATEMENT_MT940',
//   ACCOUNT_MOVEMENTS = 'ACCOUNT_MOVEMENTS',
//   ACCOUNT_BALANCES = 'ACCOUNT_BALANCES',
//   BALANCE_SHEET = 'BALANCE_SHEET',
//   CARD_FILE_BALANCES = 'CARD_FILE_BALANCES',
//   OUTGOING_PAYMENT_INVENTORY = 'OUTGOING_PAYMENT_INVENTORY',
//   PAYMENT_ORDER_REGISTRY = 'PAYMENT_ORDER_REGISTRY',
//   MERCHANT_TERMINAL_REGISTRY = 'MERCHANT_TERMINAL_REGISTRY',
//   CARD_FILE_1 = 'CARD_FILE_1',
//   CARD_FILE_2 = 'CARD_FILE_2',
//   CBU_EXCHANGE_RATES = 'CBU_EXCHANGE_RATES'
// }

// export const ReportTypeRu: Record<ReportType, string> = {
//   [ReportType.REPORT]: 'Отчет',
//   [ReportType.REPORT_INFO]: 'Информация об отчете',
//   [ReportType.ACCOUNT_ACTIVITY_INFO]: 'Движение по счету',
//   [ReportType.WITH_CORRESPONDENT]: 'С корреспондентом',
//   [ReportType.OPERATING_DAY]: 'Операционный день',
//   [ReportType.PERSONAL_ACCOUNT_STATEMENT]: 'Выписка по счету',
//   [ReportType.DOCUMENT_STATEMENT]: 'Выписка по документам',
//   [ReportType.TERMINAL_STATEMENT]: 'Выписка по терминалам',
//   [ReportType.CURRENCY_OPERATIONS_STATEMENT]: 'Выписка по валютным операциям',
//   [ReportType.PAYMENT_DOCUMENTS]: 'Платежные документы',
//   [ReportType.ACCOUNT_ACTIVITY_CERTIFICATE]: 'Справка о движении средств',
//   [ReportType.FIVE_DIGIT_ACCOUNT_CERTIFICATE]: 'Справка по 5-значному счету',
//   [ReportType.BANK_STATEMENT_1C]: 'Банковская выписка 1C',
//   [ReportType.BANK_STATEMENT_MT940]: 'Банковская выписка MT940',
//   [ReportType.ACCOUNT_MOVEMENTS]: 'Движение средств по счетам',
//   [ReportType.ACCOUNT_BALANCES]: 'Остатки на счетах',
//   [ReportType.BALANCE_SHEET]: 'Бухгалтерский баланс',
//   [ReportType.CARD_FILE_BALANCES]: 'Остатки по картотеке',
//   [ReportType.OUTGOING_PAYMENT_INVENTORY]: 'Реестр исходящих платежей',
//   [ReportType.PAYMENT_ORDER_REGISTRY]: 'Реестр платежных поручений',
//   [ReportType.MERCHANT_TERMINAL_REGISTRY]: 'Реестр терминалов',
//   [ReportType.CARD_FILE_1]: 'Картотека 1',
//   [ReportType.CARD_FILE_2]: 'Картотека 2',
//   [ReportType.CBU_EXCHANGE_RATES]: 'Курсы валют ЦБ РУз',
// };


// export type ReportTypeKey = keyof typeof ReportType;
// =================== END OF  Report Type ===================


// =================== Report Regular Schedule ===================

export enum ReportRegularScheduleEnum {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}
export const ReportRegularScheduleEnumRu: Record<ReportRegularScheduleEnum, string> = {
  [ReportRegularScheduleEnum.DAILY]: 'Каждый день',
  [ReportRegularScheduleEnum.WEEKLY]: 'Раз в неделю',
  [ReportRegularScheduleEnum.MONTHLY]: 'Раз в месяц',
};



export type ReportRegularScheduleEnumKey = keyof typeof ReportRegularScheduleEnum;


// =================== END OF  Report Regular Schedule ===================




export interface StatmentApplicationReqBody {
  applicationTypes: string[];
  applicationTypesNotIn: string[];
  applicationStatus: string[];
  transactionStepFilter: TransactionStepFilterType;
  pageSize: number;
  sender: string;
  receiver: string;
  dateFrom: string;
  dateTo: string;
  amountFrom: number;
  amountTo: number;
  docNum: string;
  currency: string;
  searchText: string;
  pageNum: number;
  isTemplate: boolean;
  templateId: number;
  reportTypes: ReportType[];
  reportFileType: ReportFileType;
  email: string;
  sendEmail: boolean;
  reportFrequencyEnum?: ReportFrequencyEnumKey | string;
  reportRegularScheduleEnum: ReportRegularScheduleEnumKey;
}
export interface StatmentApplicationRes {
  totalPages: number;
  totalElements: number;
  size: number;
  content: StatmentApplicationResContent[];
  number: number;
  sort: Sort;
  pageable: Pageable;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface StatmentApplicationResContent {
  applicationId: number;
  applicationStatus: string;
  frontApplicationStatus: string;
  absStatus: string;
  isEdited: boolean;
  isTemplate: boolean;
  templateId: number;
  stepDto: StepDto[];
  createdDate: string;
  updatedAt: string;
  externalId: string;
  applicationType: string;
  businessName: string;
  userSigns: UserSign[];
  buttons: Button[];
  businessInn: string;
  errorMessage: string;
  accountApplicationDto: AccountApplicationDto;
  cardApplicationDto: CardApplicationDto;
  loanApplicationDto: LoanApplicationDto;
  conversionApplicationDto: ConversionApplicationDto;
  swiftApplicationDto: SwiftApplicationDto;
  depositOpenApplicationRes: DepositOpenApplicationRes;
  reportApplicationDto: ReportApplicationDto;
  accreditApplicationDto: AccreditApplicationDto;
  createdDateFormatted: string;
}

export interface AccountApplicationDto {
  filialNumber: string;
  accountType: AccountType[];
  director: Director;
  headOfFinance: Director;
  accountNumberToClose: string[];
  closeReason: string;
}

export interface AccountType {
  currency: string;
  accountTypeCode: string;
  accountTypeName: string;
}

export interface Director {
  name: string;
  pinfl: string;
  passport: string;
  issuedDate: string;
  issuedBy: string;
  email: string;
  phone: string;
  username: string;
}

export interface AccreditApplicationDto {
  currency: string;
  businessName: string;
  inn: string;
  userId: string;
  businessId: string;
  attachment1: string;
  attachment2: string;
  attachment3: string;
  amount: string;
}

export interface Button {
  name: string;
  actionType: string;
  statusNameFront: string;
}

export interface CardApplicationDto {
  fullName: string;
  pinfl: string;
  docSerialNumber: string;
  maskedPan: string;
  phoneNumber: string;
  districtId: number;
  elmaId: number;
  bxmCode: string;
  cardType: string;
  productCode: string;
}

export interface ConversionApplicationDto {
  docNum: string;
  docDate: Date;
  sender: string;
  senderCurrency: string;
  senderBlockAccount: string;
  senderAmount: number;
  receiverCurrency: string;
  receiver: string;
  receiverSpecialAccount: string;
  receiverAmount: number;
  rate: number;
  detail: string;
  paymentStructure: number;
  sourceBuyCode: number;
  aimCode: string;
  aimName: string;
  receiverCountryCode: number;
  idnc: string;
  contractNumber: string;
  contractDate: string;
  partnerName: string;
  partnerCountry: string;
  shipperName: string;
  shipperCountry: string;
  benBankName: string;
  benBankCountry: string;
  termsPayment: number;
  documentUrls: string[];
  transactionId: number;
}

export interface DepositOpenApplicationRes {
  docNum: string;
  docDate: string;
  productId: number;
  amount: number;
  period: number;
  senderAccount: string;
  contractId: number;
  transactionId: number;
}

export interface LoanApplicationDto {
  agreement: string;
  amount: number;
  clientAmount: number;
  annualRate: number;
  term: number;
  paymentType: string;
  elmaId: string;
  grace: number;
  productCode: string;
  percent: number;
  currency: string;
}

export interface ReportApplicationDto {
  id: number;
  applicationName: string;
  businessId: number;
  businessName: string;
  inn: string;
  userId: number;
  account: string;
  accountId: string;
  startDate: string;
  endDate: string;
  attachmentId: string;
  downloadUrl: string;
  previewUrl: string;
  isPreview: boolean;
  reportType: string;
  reportFileType: string;
  email: string;
  sendEmail: boolean;
  reportFrequencyEnum: string;
  reportRegularScheduleEnum: string;
  isTemplate: boolean;
  templateId: number;
  reportTypeParent: string;
  correspondentAccount: string;
}

export interface StepDto {
  step: string;
  isCompleted: boolean;
}

export interface SwiftApplicationDto {
  docNum: string;
  docDate: Date;
  documentUrls: string[];
  senderAccount: string;
  senderAmount32: number;
  senderCurrency32: string;
  date32a: string;
  receiverAmount33: number;
  receiverCurrency33: string;
  currencyRate: number;
  businessName50: string;
  businessAddress50: string;
  bankCode50: string;
  correspondentBank56: string;
  bankCorrespondent56Account: string;
  bankCorrespondent56Name: string;
  bankCorrespondent56Address: string;
  bankBeneficiary57a: string;
  bankBeneficiary57Account: string;
  bankBeneficiary57Name: string;
  bankBeneficiary57Address: string;
  beneficiary59Account: string;
  beneficiary59Name: string;
  beneficiary59Address: string;
  description70: string;
  ben71: string;
  currencyBen71: string;
  narrative72: string[];
  code172: string;
  additionalInfo172: string;
  code272: string;
  additionalInfo272: string;
  code372: string;
  additionalInfo372: string;
  code472: string;
  additionalInfo472: string;
  code572: string;
  additionalInfo572: string;
  code672: string;
  additionalInfo672: string;
  code77: string;
  transactionId: number;
}

export interface UserSign {
  fullName: string;
  signDate: string;
  roleType: string;
  signOrderNumber: number;
  isFinished: boolean;
  status: string;
}

export interface Pageable {
  offset: number;
  sort: Sort;
  paged: boolean;
  unpaged: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface Sort {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
}

export interface ReportV2ListDTO {
  created_at: string;
  format: string;
  id: string;
  locale: string;
  processed_at: string;
  status: string;
  template_id: string;
  template_name: string;
  parameters: {account_id: string; date_from?: string; date_to?: string; date?: string; direction?: string; include_balances?: boolean;};
}

export interface ReportV2RegularDTO {
  created_at: string;
  enabled: boolean;
  format: string;
  id: string;
  locale: string;
  name: string;
  schedule: {frequency: string;timezone: string;};
  skip_empty: boolean;
  template_id: string;
  template_name: string;
  constant_parameters: {account_id: string; date_from?: string; date_to?: string; date?: string; direction?: string; include_balances?: boolean;};
}
