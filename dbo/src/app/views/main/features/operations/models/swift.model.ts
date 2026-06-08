export interface SwiftItem {
  applicationId: number,
  applicationStatus: string,
  applicationType: string,
  businessInn: string,
  businessName: string,
  createdDate: string,
  stepDto: SwiftStep[],
  swiftApplicationDto: SwiftApplication;
}

export interface SwiftApplication {
  paymentOrderNumber: string,
  paymentOrderDate: string,
  remitterAccount: string,
  remitterBank: string,
  currencyAmount: string,
  beneficiaryBankName: string,
  beneficiaryBankAddress: string,
  correspondentBank: string,
  beneficiaryAccount: string,
  paymentDetails: string,
  specialTerms: string,
  remitterBankCharges: string,
  foreignBankCharges: string;
  currencyCode: string;
}

export interface SwiftStep {
  step: string;
  isCompleted: boolean;
}

export interface SwiftCreate {
  docNum: string | null;
  docDate: string | null;
  senderAccount: string | null;
  businessName50: string | null;
  businessAddress50: string | null;
  senderAmount32: string | null;
  bankCode50: string | null;
  correspondentBank56: string | null;
  bankBeneficiary57a: string | null;
  bankBeneficiary57d: string | null;
  beneficiary59: string | null;
  description: string | null;
  mainCondition72: string | null;
  idn72: string | null;
  code77: string | null;
  codeName77: string | null;
}
