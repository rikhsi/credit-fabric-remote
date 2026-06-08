export interface AccreditItem {
  lcId: number;
  filialCode: string;
  contractNumber: string | null;
  contractDate: string;
  applicantBank: string | null;
  ourReference: string;
  currency: string;
  amountBegin: string;
  amount: string;
  issueDate: string | null;
  expireDate: string | null;
  idnk: string;
  accLc: string;
  accLcContr: string;
  state: string;
  reasonForRejection: string;
}

export interface CreateAccredit {
  // businessName: string;
  // inn: string;
  // userId: string;
  // businessId: string;
  amount: string;
  currency: string;
  attachment1: string;
  attachment2: string;
  attachment3: string;
}

