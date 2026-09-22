import { ApplicationStatus, DocumentItem } from './application';

export interface OnlineGetInfoResult {
  creditAgreementId: number;
  docs: DocumentItem[];
  currency: string;
  decisionId: number;
  id: number;
  loanAmount: number;
  loanTerm: number;
  paymentType: string;
  productName: string;
  rate: number;
  sysStatusId: ApplicationStatus;
  /** Optional until backend starts returning it. */
  createdDate?: string;
}

export interface EligibilityResult {
  eligible: boolean;
}

export interface OnlineBranchItem {
  filialCode: number;
}

export interface OnlineBranchesResult {
  branches: OnlineBranchItem[];
}
