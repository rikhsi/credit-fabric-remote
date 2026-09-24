import { HandbookItem } from './item';

export enum ApplicationStatus {
  OnDesign = 'ON_DESIGN',
  OnFormFill = 'ON_FORM_FILL',
  OnDecision = 'ON_DECISION',
  Approved = 'APPROVED',
  InProgress = 'IN_PROGRESS',
  Signed = 'SIGNED',
  Issued = 'ISSUED',
  Decline = 'DECLINE',
  DeclineClient = 'DECLINE_CLIENT',
  Error = 'ERROR',
}

export interface DocumentItem {
  createdDate: string;
  id: number;
  isSigned: boolean;
  signedDate: string;
  type: string;
}

export type DocumentType = 'LOAN_DECISION' | 'LOAN_AGREEMENT';

export interface OnlineBorrowerAddress {
  addresSysIndividualLegalEntityId: string;
  dirCityId: string;
  dirCountryId: string;
  dirRegionId: string;
  dirVillageId: string | null;
  dirVillageTx: string | null;
  employmentId: number | null;
  id: number;
  street: string;
  sysAddressTypeId: string;
  sysAddressTypeIndividualId: string;
  sysAddressTypeLegalEntityId: string;
  zipCode: string;
}

export interface OnlineBorrower {
  addresses?: OnlineBorrowerAddress[];
  docPersonalLegalNo: string;
  email: string;
  employees: number | null;
  id: number;
  legalForm: HandbookItem;
  name: string;
  newEmployees: number | null;
  oked: HandbookItem;
  ownershipCode: HandbookItem;
  registrationDate: Date;
  registrationNumber: string;
  registrationPlaceCode: string;
  workPhone: string | null;
}

export interface OnlineApplicationFinData {
  activityShare: number;
  activityTerm: number;
  activityTermStr: string;
  description: string;
  dirCompanyActivityId: string;
  id: number;
  month1Income: number;
  month1Revenue: number;
  month2Income: number;
  month2Revenue: number;
  month3Income: number;
  month3Revenue: number;
  monthIncome: string;
  monthRevenue: string;
  monthYear: string;
  monthYear1: string;
  monthYear2: string;
  monthYear3: string;
  profitability: number;
  sysMonth1Id: string;
  sysMonth2Id: string;
  sysMonth3Id: string;
  uwProfitability: number;
  year1: number;
  year2: number;
  year3: number;
}

export interface OnlineApplicationProduct {
  loanAmount: number;
  loanRate: number;
  loanTerm: number;
  monthlyPayment: number;
  paymentType: string;
  product: string;
}

export interface OnlineOffer {
  offerId: string;
  product: string;
  loanAmount: number;
  loanRate: number;
  loanTerm: number;
  paymentType: string;
}

export interface OnlineApplication {
  accountNo: string;
  offerId: string;
  borrower: OnlineBorrower;
  docs?: DocumentItem[];
  finData: OnlineApplicationFinData[];
  product: OnlineApplicationProduct;
  sysStatusId: ApplicationStatus;
}

export interface ClaimLoanPayload {
  applicationId: number;
  isAccepted: boolean;
  offerId: string;
}

export interface ClaimLoanResult {
  is_show_toastr: boolean;
  statusCode: string;
  statusDesc: string;
  statusTitle: string;
}
