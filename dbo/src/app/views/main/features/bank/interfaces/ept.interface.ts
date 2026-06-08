
export interface EptDoc {
  isAccept: string;
  documentId: string;
  creditorId: string;
  docNumber: number;
  docDate: string;
  summa: number;
  payerBank: string;
  payerBranch: string;
  payerAccount: string;
  payerInn: string;
  payerName: string;
  payeeBank: string;
  payeeBranch: string;
  payeeAccount: string;
  payeeInn: string;
  payeeName: string;
  paymenType: string;
  unpaid: string;
  purposeCode: string;
  purpose: string;
  sumUnlead: number;
  sumRecall: number;
  sumPaid: number;
  sumRest: number;
  sumIgnore: number;
  stateId: number;
  errorCode: string;
}

export interface EptOperation {
  id: number,
  type: string,
  state: string,
  resultId: number,
  resultSum: number,
  createdOn: string,
  resultErrCode: string,
  modifiedOn: string
}


export interface Recall {
  recallId: string,
  sumRecalled: string,
  documentId: number,
  stateId: string,
  errorCode: string
}
