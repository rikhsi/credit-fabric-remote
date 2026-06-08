export interface RequestConversionReqNewDto {
  senderAccount: string | null;
  senderBlockAccount: string | null;
  receiverAccount: string | null;
  receiverSpecialAccount: string | null;
  senderAmount: number | null;
  specialAccount: string | null;
  clientCurrencyOfferRate: number | null;
  clientCurrencyOfferAmount: number | null;
  description: string | null;
  attachedFiles: any
  currencyAmount: number | null;
  docNum?: string | null;
  docDate?: any

  transactionMode?: string | null;
  filialBlockMfo?: string | null;
  filialBlockAcc?: string | null;
  sourceBuyCode?: number | null;
  termsPayment?: number | null;
  thvedCode?: string | null;
  idnc?: string | null;
  taskCode?: string | null;
  purposeType?: string | null;
  purposeText?: string | null;
  countryDest?: string | null;
  partnerCountry?: string | null;
  partnerName?: string | null;
  shipperCountry?: string | null;
  shipperName?: string | null;
  benBankCountry?: string | null;
  benBankName?: string | null;
  contractNumber?: string | null;
  contractDate?: string | null;
  summaEisvo?: number | null;
  productName?: string | null;
  sourceCode?: string | null;
}
