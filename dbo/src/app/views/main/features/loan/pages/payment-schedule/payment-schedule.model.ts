export interface PaymentScheduleResDto{
  loanId: number
  currency: Currency
  totals: Totals
  items: Item[]
}

export interface Currency {
  currency: string
  logo: Logo
}

export interface Logo {
  contentType: string
  path: string
  name: string
  ext: string
}

export interface Totals {
  totalDept: TotalDept
  totalPercent: TotalPercent
  totalAll: TotalAll
}

export interface TotalDept {
  amount: number
  scale: number
  currency: string
}

export interface TotalPercent {
  amount: number
  scale: number
  currency: string
}

export interface TotalAll {
  amount: number
  scale: number
  currency: string
}

export interface Item {
  repaymentDate: string
  amount: Amount
  interestOnTermDebt: InterestOnTermDebt
  recommendedAmount: RecommendedAmount
  principalBalance: PrincipalBalance
  saldo: Saldo
}

export interface Amount {
  amount: number
  scale: number
  currency: string
}

export interface InterestOnTermDebt {
  amount: number
  scale: number
  currency: string
}

export interface RecommendedAmount {
  amount: number
  scale: number
  currency: string
}

export interface PrincipalBalance {
  amount: number
  scale: number
  currency: string
}

export interface Saldo {
  amount: number
  scale: number
  currency: string
}
