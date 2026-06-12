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

export interface OnlineApplication {
  borrower: OnlineBorrower;
}

export interface ShortApplicationPayload {
  applicantPersonalNo: string;
  dirCreditPurposeId: string;
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
