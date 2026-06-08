
export interface Ambulance {
  clientId: number;
  clientCode: string;
  clAcc: string;
  clName: string;
  docNum: string;
  dateAct: string; // Consider using Date or string if it's an ISO date string
  dateDeact: string; // Consider using Date or string if it's an ISO date string
  dateCorrect: string; // Consider using Date or string if it's an ISO date string
  sumNeed: number;
  sumNeedPay: number;
  sumNeedPaid: number;
  issue: number;
  sumNeedDay: number;
  sumNeedUnl: number;
  cashSym: string;
  payPurpose: string;
  state: string;
  stateName: string;
  neotlId: number;
  branchId: number;
  localCode: string;
  clAccFull: string;
}
