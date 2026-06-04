import { ApplicationStatus, DocumentItem } from './application';

export interface OnlineCheckResult {
  isOtpValidated: boolean;
}

export interface OnlineSendOtpResponse {
  phoneNumber: string;
  pinfl: string;
}

export interface OnlineSendOtpResult {
  errorCode: string;
  isOtpSent: boolean;
}

export interface OnlineCheckOtpResponse {
  phoneNumber: string;
  pinfl: string;
  otpCode: string;
}

export interface OnlineCheckOtpResult {
  errorCode: string;
  isOtpValidated: boolean;
}

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

export interface OnlineApplicant {
  age: number;
  applicationId: number;
  approvedIncome: number;
  birthCountryId: string;
  birthDate: Date;
  birthPlace: string;
  bosses: string;
  brms1ResponseId: number;
  brms2ResponseId: number;
  brms3ResponseId: number;
  brms4ResponseId: number;
  brms5ResponseId: number;
  brms6ResponseId: number;
  brms7ResponseId: number;
  brms8ResponseId: number;
  citizenshipCountryId: string;
  comment: string;
  contactLanguage: string;
  created: Date;
  creditBureauConsent: string;
  creditPropertyConsent: string;
  creditReportId: number;
  crmTypeId: string;
  decisionMakingExpenses: number;
  decisionMakingIncome: number;
  dirEcologicalImpactCodeId: string;
  dirEducationId: string;
  dirEnterpriseClassifierId: string;
  dirJobPositionId: string;
  dirLegalFormId: string;
  dirMaritalStatusId: string;
  dirObjectNewFormationId: string;
  dirOkedId: string;
  dirOwnershipCodeId: string;
  dirSectorEconomyCode: string;
  dirSectorEconomyId: string;
  dirSegmentId: string;
  dirVisualAssessmentId: string;
  docDirCountryid: string;
  docDirIdentityCardTypeId: string;
  docIssueDate: Date;
  docIssuedBy: string;
  docLegalNo: string;
  docNo: string;
  docPersonalLegalNo: string;
  docPersonalNo: string;
  docValidityDate: Date;
  email: string;
  employees: number;
  employmentId: number;
  factAddress: string;
  firstName: string;
  founders: string;
  fullFormIncome: number;
  genderCode: number;
  generatedCode: string;
  guarantorChangeConsent: string;
  headerOrgCode: string;
  headerOrgName: string;
  iabsClientCode: string;
  iabsClientId: string;
  id: number;
  identityCardId: number;
  inBlackList: boolean;
  integrationSysStatusId: string;
  isMyidPassed: boolean;
  isPersonalConsent: boolean;
  isPreapproved: boolean;
  isRealEqFactAddress: boolean;
  isResident: boolean;
  lastName: string;
  lastUpdateAddress: Date;
  lastUpdatePassData: Date;
  maxTermAge: number;
  middleName: string;
  mobilePhone: string;
  mobilePhoneMasked: string;
  name: string;
  nameJur: string;
  nationality: string;
  newEmployees: number;
  nibbdId: string;
  numberChildrenUnder18: number;
  numberOfEnrolment: number;
  onlineExtClientId: string;
  parentApplicantId: number;
  photo: string;
  postAddress: string;
  receivedCode: string;
  regAddress: string;
  registrationBirthDate: Date;
  registrationDate: Date;
  registrationNumber: string;
  registrationPlaceCode: string;
  reportReceiveConsent: string;
  rsClientId: string;
  shareAmount: number;
  sharePercent: number;
  shortFormIncome: number;
  smsApplicationConsent: string;
  smsPmtConsent: string;
  sysApplicantRoleId: string;
  sysApplicantStatusId: string;
  sysBrmsDecisionId: string;
  sysGenderId: string;
  sysIndividualLegalEntityId: string;
  sysRiskGradeId: string;
  totalJobExp: number;
  updated: Date;
  userTaskId: string;
  visualAssessmentComment: string;
  workPhone: string;
  workPhoneMasked: string;
}

export interface OnlineAdress {
  addresSysIndividualLegalEntityId: string;
  applicantId: number;
  created: Date;
  dirCityId: string;
  dirCountryId: string;
  dirRegionId: string;
  dirVillageId: string;
  dirVillageTx: string;
  employmentId: number;
  id: number;
  street: string;
  sysAddressTypeId: string;
  sysAddressTypeIndividualId: string;
  sysAddressTypeLegalEntityId: string;
  updated: Date;
  zipCode: string;
}

export interface OnlineFinData {
  activityShare: number;
  activityTerm: number;
  activityTermStr: string;
  applicantId: number;
  applicationId: number;
  changedByUsername: string;
  created: Date;
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
  updated: Date;
  uwProfitability: number;
  year1: number;
  year2: number;
  year3: number;
}

export interface OnlineStartProcessingExtraInformation {
  ecologicalImpactCode: string | null;
  enterpriseClassfier: string | null;
  objectNewFormation: string | null;
  sectorEconomy: string | null;
}

export interface OnlineStartProcessingFinData {
  dirCompanyActivityId: string | null;
  activityTerm: number | null;
  sysMonth1Id: string | null;
  sysMonth2Id: string | null;
  sysMonth3Id: string | null;
  month1Revenue: number | null;
  month1Income: number | null;
  month2Revenue: number | null;
  month2Income: number | null;
  month3Revenue: number | null;
  month3Income: number | null;
}

export interface OnlineStartProcessingAddress {
  sysAddressTypeId: string | null;
  dirCityId: string | null;
  dirVillageId: string | null;
  street: string | null;
  zipCode: string | null;
  dirCountryId: string | null;
}

export interface OnlineCreateApplicationPayload {
  accountNo: string;
  cardNumber: string;
  addresses: OnlineStartProcessingAddress | null;
  applicationId: number;
  docPersonalLegalNo: string | null;
  email: string | null;
  employees: number | null;
  extraInformation: OnlineStartProcessingExtraInformation | null;
  finData: OnlineStartProcessingFinData | null;
  legalForm: string | null;
  name: string | null;
  newEmployees: number | null;
  oked: string | null;
  ownershipCode: string | null;
  registrationDate: Date | null;
  registrationNumber: string | null;
  registrationPlaceCode: string | null;
  workPhone: string | null;
}

export interface OnlineLegalForm {
  id: number;
  value: string;
}

export interface OnlineOked {
  id: number;
  value: string;
}

export interface OnlineOwnershipCode {
  id: number;
  value: string;
}

export interface OnlineBorrower {
  docPersonalLegalNo: string;
  email: string;
  employees: number;
  id: number;
  legalForm: OnlineLegalForm;
  name: string;
  newEmployees: number;
  oked: OnlineOked;
  ownershipCode: OnlineOwnershipCode;
  registrationDate: Date;
  registrationNumber: string;
  registrationPlaceCode: string;
  workPhone: string;
}

export interface OnlineApplicationAddress {
  addressType: string;
  city: number;
  address: string;
  street: number;
  postalCode: string;
}

export interface OnlineApplicationExtraInformation {
  sectorEconomy: number;
  objectNewFormation: number;
  enterpriseClassifier: number;
  ecologicalImpactCode: number;
}

export interface OnlineApplication {
  borrower: OnlineBorrower;
  adresses: OnlineApplicationAddress[];
  extraInformations?: OnlineApplicationExtraInformation[];
  finData?: OnlineFinData[];
}

export interface OnlineCreateApplicationResult {
  is_show_toastr: boolean;
  statusCode: string;
  statusDesc: string;
  statusTitle: string;
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
