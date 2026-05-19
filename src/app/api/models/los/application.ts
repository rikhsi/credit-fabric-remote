export enum ApplicationStatus {
  Approved = 'APPROVED',
  OnAssign = 'ON_ASSIGN',
  OnDesign = 'ON_DESIGN',
  InProgress = 'IN_PROGRESS',
  Signed = 'SIGNED',
  Issued = 'ISSUED',
  Decline = 'DECLINE',
  DeclineClient = 'DECLINE_CLIENT',
}

export interface DocumentItem {
  createdDate: string;
  id: number;
  isSigned: boolean;
  signedDate: string;
  type: string;
}

export type DocumentType = 'LOAN_DECISION' | 'LOAN_AGREEMENT';
