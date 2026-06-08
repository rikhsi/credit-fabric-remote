import { pageable } from "../../accounts-payments/models/accounts-payments.model";
import { s } from "@angular/cdk/scrolling-module.d-ud2XrbF8";

export interface PagableResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: pageable;
  size: number;
  sort: { empty: true; sorted: boolean; unsorted: true };
  totalElements: number;
  totalPages: number;
}

export interface ILoanProduct {
  id: number;
  name: string;
  shortDescription: string;
  maxAmount: number;
  minAmount: number | null;
  period: number;
  percentage: number;
  gracePeriod: number;
  imagePath: string;
  aimCredit: string;
  withLoanLine: boolean;
  persentageMap: Record<string, string>; // A map of periods to percentages (e.g., {"12": "24"})
  persentageCurrencyMap: Record<string, string>; // A map of periods to currency percentages
  description1: string;
  description2: string;
  description3: string;
  aimCreditShort: string;
  submissionForm: string;
  frequencyPayment: string; // Possible values like "MONTHLY"
  repaymentTypes: string[]; // Possible values like "ANNUITY", "DIFFERENTIAL"
  loanOfferType: string;
  necessaryDocumentInfoList: string[]; // List of document descriptions
  necessaryDocumentList: Record<string, any>; // Map of document names to their URLs
  status: string; // Possible values like "ACTIVE"
}

export interface LoanDto {
  loan1:string
  annualRate: number;
  percentageDebt:number
  finMateDate:string
  attachmentId: string;
  loanPurpose: string;
  annualLoanPercentage: string;
  loanId: number;
  attachedAccount: string;
  calculationMethod: string;
  accountTitle: string;
  creditType: string;
  repaymentDate: string;

  id: number;
  imagePath: string;
  fullAmount:{
  amount: number
  scale: number
  currency: string
}
  mainDebt:{
    amount: number
    scale: number
    currency: string
  }
  interestAmount:{
    amount: number
    scale: number
    currency: string
  }
  totalAmount:{
    amount: number
    scale: number
    currency: string
  }
  repaymentAmount:{
    amount: number
    scale: number
    currency: string
  }
  loanCurrency: string;
  loanPeriod: number;
  loanStatus: string;
  maxAmount: number;
  creditName:string
  minAmount: number;
  payInsurance: boolean;
  translateList: null | any;
  extraFields: null | any;
  gracePeriod: string;
  arrangementId: string;
  currency: string;
}

export interface LoanApplicationDto {
  period: number
  paymentType: string
  grace: number
  currency: string
  id: string
  responseId: string
  requestId: string
  businessId: string
  status: string
  productId: string
  amount: number
  annualRate: number
  date:string
  step:string
}

export interface LoanDownloadUrl {
  msg: string;
}

export interface LoanSchedule {
  data: Schedule[];
  principalBalance: number;
  totalDept: number;
  totalAll: number;
  totalPercent: number;
}

export interface Schedule {
  amount: number;
  repaymentDate: string;
  interestOnTermDebt: number;
  saldo: number;
  recommendedAmount: number;
}

export interface PreparePaymentRequest {
  amount: number;
  senderAccount: string;
  loanId: string;
  type: string;
}

export interface RequestToLoan {
  period: number | null | undefined;
  amount: number;
  currency: string | null | undefined;
  id: number | null | undefined
  identityPhoto:string
}

export interface PageRequest {
  paging: {
    page: number;
    size: number;
  };
  params: {
    lang: string;
  };
}
export type LoanHistoryDto = {
  content:LoanHistoryDetail[]
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  pageable: string
  size: number
  sort: {empty: boolean, unsorted: boolean, sorted: boolean}
  totalElements: number
  totalPages: number

}

export enum LoanTypes {
  MAIN = 'MAIN',
  PERCENTAGE = 'PERCENTAGE',
  HISTORY = 'HISTORY',
}

export type LoanHistoryDetail = {
  dtAccName: string
  purpose:string
  isDebit:boolean
  dtMfo: string
  dtAcc: string
  date: string
  totalDue: string
  totalCap:string
  total: number
  principal: number
  interest: number
  charge: string
  tax: string
  totalPmnt: number
  outstanding: number
  coAccName:string
  lnType: number
  dateExecute: string
}

export type LoanDetail = {
  arrangementId:number
  accountTitle: string
  loanId: number
  loan1:string
  repaymentDate: string
  repaymentAmount: {
    amount: number
    scale: number
    currency: string
  }
  repaymentAmountMain: {
    amount: number
    scale: number
    currency: string
  }
  fullAmount: {
    amount: number
    scale: number
    currency: string
  }
  mainDebt: {
    amount: number
    scale: number
    currency: string
  }
  overdueAmount: {
    amount: number
    scale: number
    currency: string
  }
  overPercentage: {
    amount: number
    scale: number
    currency: string
  }
  penalty: {
    amount: number
    scale: number
    currency: string
  }
  interestAmount: {
    amount: number
    scale: number
    currency: string
  }
  totalAmount: {
    amount: number
    scale: number
    currency: string
  }
  overduePercentageDebt: {
    amount: number
    scale: number
    currency: string
  }
  percentageDebt: {
    amount: number
    scale: number
    currency: string
  }
  percent: string;
  finMateDate:string
  currency:string
  status: string
  gracePeriod: string
  closeDate: string;
}

export interface LoanItem {
  cardName: string;
  status: LoanStatus;
  pan: string;
  account: number;
  hasPinned: boolean;
  nextDueDate: string;
  nextAmountDue: number;
  logo: string;
  logoAlt: string;
  balance: {
    currency: string;
    amount: number;
  }
}


export interface Guar {
  type: string;
  summ: string;
}

export interface LoanDetailNew {
  percComiss: string;
  methodCalculation: string;
  nextPaydate: string;
  accMain: string;
  regDate: string;
  crdTypename: string;
  paymentFrequency: string;
  guars: Guar[];
  nextPaysum: Amount;
  conditionOverpay: string;
  percMain: string;
  percFine: string;
  percType: string;
    isNextPaydateExpire:boolean
}

export interface Amount {
    amount:   number;
    scale:    number;
    currency: string;
    logo:{
      name:string,
      path:string
    }
}

export interface Loan {
  state: string;
  totalDebt: {
    amount: number,
    currency: string,
    scale: number,
    logo:{
      name:string,
      path:string
    }
  };
  stateLogo: {
    name: string,
    path: string,
  }
  amount: number;
  pinned: boolean;
  detail: LoanDetailNew;
  card: LoanCard;
  currency: string;
  loanId: string;
  status:string

}

export interface LoanCard {
  crd_regdate: string;
  early_repayment: string;
  overdue_debt: string;
  guars: any[];
  crd_number: string;
  perc_main: string;
  crd_typename: string;
  perc_rest: string;
  graph_type: string;
  crd_object: string;
  crd_state: string;
  overdue_perc: string;
  crd_retdate: string;
  crd_curcode: string;
  crd_sum: string;
  crd_rest: string;
}

export type LoanStatus = 'ACTIVE' | 'EXPIRED' | 'CLOSED';

export const statusLabel: Record<LoanStatus, string> = {
  ACTIVE: 'Активный',
  EXPIRED: 'Просрочен',
  CLOSED: 'Завершенный',
}

export const statusIcon: Record<LoanStatus, string> = {
  ACTIVE: './assets/new-icons/active-account.svg',
  EXPIRED: './assets/new-icons/error-warning-fill.svg',
  CLOSED: './assets/new-icons/error-warning-fill.svg',
}
