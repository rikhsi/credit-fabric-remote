import { ReportTypeKey } from "../../models/report.model";
import { ReportFileType, ReportFrequencyEnumKey, ReportRegularScheduleEnumKey } from "../../models/statement-history.model";

export interface Account {
  id: string;
  accountTitle: string;
  accountType: string;
  altAcctId: string;
  balance: Balance;
  isTransactionAllowed: boolean;
  openDate: string;
  saldoUnlead: number | null;
  status: string;
  value: number;
}
export interface Balance {
  amount: number;
  scale: number;
  currency: string;
  logo: string | null;
}


export interface CreateReportReqDto {
  applicationName?: string;
  paging?: Paging;
  account: string;
  accountId?: number | string | null;
  date: DateClass;
  isReal?: boolean;
  autoId?: boolean;
  reportType: ReportTypeKey | string;
  reportFileType: ReportFileType | string;
  email?: string;
  sendEmail: boolean;
  reportFrequencyEnum: ReportFrequencyEnumKey | string;
  reportRegularScheduleEnum?: ReportRegularScheduleEnumKey | string;
  byMask?: boolean;
  correspondentAccount: string | null;
  transactionType: string | null;
  dailyTurnover: boolean | null;
  includeResidues: boolean | null;
  currency: string | null;
}

export interface DateClass {
  dateBegin: string;
  dateClose: string;
}

export interface Paging {
  page: number;
  size: number;
}

