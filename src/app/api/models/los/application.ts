import { HandbookItem } from './item';

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

export interface OnlineBorrower {
  docPersonalLegalNo: string;
  email: string;
  employees: number;
  id: number;
  legalForm: HandbookItem;
  name: string;
  newEmployees: number;
  oked: HandbookItem;
  ownershipCode: HandbookItem;
  registrationDate: Date;
  registrationNumber: string;
  registrationPlaceCode: string;
  workPhone: string;
}

export interface OnlineApplication {
  borrower: OnlineBorrower;
}

export interface ShortApplicationPayload {
  applicantPersonalNo: string;
  dirCurrencyId: string;
  initUsername: string;
  loanAmount: number;
  loanTerm: number;
  sysPaymentTypeId: string;
}

export interface ShortApplicationResult {
  applicationId: number;
  statusCode: string;
  statusDesc: string;
  statusTitle: string;
}
