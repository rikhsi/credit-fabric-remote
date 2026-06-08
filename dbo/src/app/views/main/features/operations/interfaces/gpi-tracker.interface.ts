interface Amount {
  amount: number;
  scale: number;
  currency: string;
  logo: string | null;
}

export interface Tracker {
  bic: string;
  bicOrgName: string;
  bicAddress: string | null;
  bicCity: string | null;
  receivedTimeGMT: string | null;
  receivedDateAndTime: string | null;
  sentTimeGMT: string | null;
  sentTimeDateAndTime: string | null;
  holdPeriod: string | null;
  receivedAmount: Amount | null;
  sentAmount: Amount | null;
  commission: Amount | null;
  status: string | null;
  order: number;
  isStartPoint: boolean;
  isFinishPoint: boolean;
  reference: string;
}

export interface IGpiTracker {
  status: string;
  sentAmount: Amount;
  receivedAmount: Amount | null;
  overallCommission: Amount | null;
  sentTimeGMT: string;
  receivedTimeGMT: string | null;
  totalDuration: string | null;
  sentDateAndTime: string;
  receivedDateAndTime: string | null;
  errorMessage: string | null;
  trackerList: Tracker[];
}
