export interface PrepareLoanTransactionReqDto {
  sender: Sender
  recipient: Recipient
  purpose: string
  payDate: string
  docNum: string
  docDate: string
  amount: number
  loanId:string
  description:string
}

export interface Sender {
  account: string
  codeFilial: string
  tax: string
  name: string
}

export interface Recipient {
  name: string
  account: string
}



export interface LoanDetailDto {
  amount:LoanAmount;
  creditName: string;
  creditNumber: string;
  currency: string;
  creditRest: LoanAmount;
  percMain: string;
  graphType: string;
  regDate: string;
  retDate: string;
  crdObject: string;
  guarantee: string;
  active: boolean;
  creditTypeName:string
  state:string,
  stateLogo:{
    contentType:any,
    ext:any,
    name:string
    path:string
  }
}

interface LoanAmount{

    amount: number;
    scale: number;
    currency: string;
    logo?: {
      contentType: string;
      path: string;
      name: string;
      ext: string;
    };

}


export interface OneLoanResDto {
  amount: Amount
  totalDebt: TotalDebt
  currency: string
  state: string
  status: string
  stateLogo: StateLogo
  detail: Detail
  card: Card
  loanId: string
  pinnedOrder: number
  pinned: boolean
}

export interface Amount {
  amount: number
  scale: number
  currency: string
  logo: Logo
}

export interface Logo {
  contentType: string
  path: string
  name: string
  ext: string
}

export interface TotalDebt {
  amount: number
  scale: number
  currency: string
  logo: Logo2
}

export interface Logo2 {
  contentType: string
  path: string
  name: string
  ext: string
}

export interface StateLogo {
  contentType: string
  path: string
  name: string
  ext: string
}

export interface Detail {
  percComiss: string
  accCurr: string
  methodCalculation: string
  nextPaydate: string
  isNextPayDateExpire: boolean
  accMain: string
  regDate: string
  crdTypename: string
  paymentFrequency: string
  guars: Guar[]
  nextPaysum: NextPaysum
  conditionOverpay: string
  percMain: string
  percFine: string
  percType: string
  guarantors: Guarantor[]
}

export interface Guar {
  type: string
  summ: string
}

export interface NextPaysum {
  amount: number
  scale: number
  currency: string
  logo: Logo3
}

export interface Logo3 {
  contentType: string
  path: string
  name: string
  ext: string
}

export interface Guarantor {
  name: string
  inn: string
}

export interface Card {
  crd_number: string
  crd_curcode: string
  crd_state: string
  crd_sum: CrdSum
  crd_rest: string
  perc_main: string
  crd_typename: string
  graph_type: string
  crd_regdate: string
  crd_retdate: string
  crd_object: string
  guars: Guar2[]
  overdue_debt: OverdueDebt
  overdue_perc: OverduePerc
  perc_rest: string
  early_repayment: string
}

export interface CrdSum {
  amount: number
  scale: number
  currency: string
  logo: Logo4
}

export interface Logo4 {
  contentType: string
  path: string
  name: string
  ext: string
}

export interface Guar2 {
  type: string
  summ: string
}

export interface OverdueDebt {
  amount: number
  scale: number
  currency: string
  logo: Logo5
}

export interface Logo5 {
  contentType: string
  path: string
  name: string
  ext: string
}

export interface OverduePerc {
  amount: number
  scale: number
  currency: string
  logo: Logo6
}

export interface Logo6 {
  contentType: string
  path: string
  name: string
  ext: string
}
