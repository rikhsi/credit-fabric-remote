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
}
