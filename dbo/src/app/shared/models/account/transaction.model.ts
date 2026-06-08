export interface DailyTransactionResDto {
  account: string
  date: string
  totalDebit: TotalDebit
  totalCredit: TotalCredit
  amountBegin: AmountBegin
  amountEnd: AmountEnd
}

export interface TotalDebit {
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

export interface TotalCredit {
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

export interface AmountBegin {
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

export interface AmountEnd {
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
