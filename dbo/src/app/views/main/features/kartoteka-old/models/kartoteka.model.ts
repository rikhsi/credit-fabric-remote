 export type kartotekaResponse ={
 content:KartotekaContent[]
 paging:{
   pageNumber: number
   pageSize: number
   totalPages: number
   totalItems: number
 }
}
 export type KartotekaContent = {
   cardType: number
   cipherCode: string
   cipherName: string
   clAcc :string
   coAcc: string
   coInn :string
   coMfo :string
   coName :string
   codeFilial :string
   dateEnter :string
   dayAccept :string
   docDate :string
   docNum: string
   datePay :string
   docType: string
   docTypeName: string
   documentId :string
   paymentType :string
   paymentTypeName :string
   purposeCode :string
   purposeName :string
   state :string
   status :string
   sumDoc: number;
   sumPay :number
   sumSaldo: number
 }

export type KartotekaTransactionsResponse = {
transacts:KartotekaTransactions[]
}

export type KartotekaTransactions = {
  documentId: number
  operDate: string
  transactId: number
  executeTime: string
  state: string
  leadType: string
  sumPay: number
  sumSaldo: number;
}




export interface RecipientData {
  coNameList: string[]
}
