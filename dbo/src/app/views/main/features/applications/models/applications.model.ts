export interface ApplicationItem {
  applicationId: number;
  applicationStatus: string;
  stepDto: {
    step: string;
    isCompleted: boolean;
  }[];
  createdDate: string;
  applicationType: string;
  businessName: string;
  businessInn: string;
  accountApplicationDto?: AccountApplicationDto;
  cardApplicationDto?: CardApplicationDto;
  loanApplicationDto?: LoanApplicationDto;
  conversionApplicationDto?:ConversionApplicationDto
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

export interface AccountApplicationDto {
  filialNumber: string;
  directorName: string;
  directorPinfl: string;
  directorNumber: number;
  directorEmail: string;
  directorDocument: string;
  headOfFinanceName: string;
  headOfFinancePinfl: string;
  headOfFinanceNumber: string;
  headOfFinanceEmail: string;
  headOfFinanceDocument: string;
}

export type ConversionApplicationDto = {

  sender: string
  receiver: string
  clientCurrencyOfferRate: null | number | string,
  clientCurrencyOfferAmount: null | number,
  senderAmount: number,
  receiverAmount: number,
  specialAccount: string
  description: string
  attachedFiles: [],
  bankName: string
  bankCode: string
  email: string
  userRole: string[]
  fullName:string
  senderCurrency:string
  receiverCurrency:string

}
