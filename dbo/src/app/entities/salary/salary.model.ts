import { CardType } from '../../shared/models/card-type';
import { CardStatus } from '../../shared/models/card-status';
import { UserType } from '../../shared/models/user-type.model';

export const ownerTypes = ['UNKNOWN', 'OWN_BANK', 'OTHER_BANK'] as const;
export type OwnerType = (typeof ownerTypes)[number];

export interface SalaryCardsReq {
  cardUuid?: string;
  page: number;
  size: number;
  type?: CardType;
  status?: CardStatus;
  userType: UserType;
  updateBalance?: boolean;
  currency?: 'UZS' | 'USD' | 'RUB' | 'EUR' | 'KZT' | 'GBP' | 'AED' | 'JPY' | 'CHF' | 'UNKNOWN' | 'CNY' | 'INR';
  transitAccount?: string;
  contractNumber?: string;
  startDate?: string;
  endDate?: string;
  cardHolder?: string;
  cardNumber?: string;
  searchText?: string;
  employeeStatus?: 'ACTIVE';
}

export type SalaryCardsByFileParseQueryReq = {
  contractNumber: string;
  transitAccount: string;
};

export type PrepareSalaryCardTransactionReq = {
  salaryPrepareReq: SalaryPrepareReq;
  employeesItems: SalaryCardPrepareReq[];
};

export type SalaryPrepareReq = {
  cardUserType: UserType;
  cardType: CardType;
  docNum: string;
  reestrNumber: string;
  contractNumber: string;
  useTransit: boolean;
  senderAccount: string;
  transitAccount: string;
  name: string;
  docDate: string;
  paymentCode: string;
  year: number;
  months: string[] | string;
  description: string;
  oldTransactionUuid?: string;
  payPurpose?: string;
  mode?: 'CR' | 'DR';
  isSaved?: boolean;
  isAutoPay?: boolean;
  autoPayCreateReq?: {
    paymentFrequency: 'MONTHLY' | 'WEAKLY';
    months: number[];
    days: number[];
    paymentDay: number;
    paymentTime: string;
    dateEnd: string;
    isAutoSend: boolean;
    withNotification: boolean;
    notificationBeforeTime:  'A_DAY' | 'AN_HOUR' | 'FIVE_MINUTE';
  }
};

export type SalaryCardPrepareReq = {
  accountNumberCard: string;
  amountTransferToCard: number;
  fio: string;
  maskedPan: string;
};

export interface SalaryCardsRes {
  content: SalaryCardRes[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    offset: number;
    sort: Sort;
  };
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  size: number;
  number: number;
  sort: Sort;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SalaryCardRes {
  uuid: string;
  pan: string;
  maskedPan: string;
  balance: {
    amount: number;
    scale: number;
    currency: string;
    logo: string | null;
  };
  cardName: string | null;
  account: string;
  logo: string | null;
  ownerName: string;
  status: CardStatus;
  statusName: string;
  type: CardType;
  ownerType: OwnerType | null;
  showBalance: boolean;
  transitAccount: string;
  expiryDate: string;
  contractNumber: string;
  cardClientId: number | null;
  hasPinned: boolean;
  pinOrder: number | null;
  title: string | null;
}

export interface SalaryCardByTransactionIdRes {
  uuid: string;
  pan: string;
  balance: {
    amount: number;
    scale: number
    currency: string;
    logo: string | null;
  };
  cardName: string | null;
  account: string;
  logo: string | null;
  ownerName: string;
  status: CardStatus;
  type: CardType;
  ownerType: OwnerType | null;
  showBalance: boolean;
  transitAccount: string;
  expiryDate: string;
  contractNumber: string;
  cardClientId: number | null;
  hasPinned: boolean;
  pinOrder: number | null;
  title: string | null;
}

export interface SalaryCardsByFileParseRes {
  errorList: SalaryCardByFileParseRes[];
  successList: SalaryCardByFileParseRes[];
}

export interface SalaryCardByFileParseRes {
  uuid: string;
  pan: string;
  account: string;
  balance: {
    amount: number;
    scale: number;
    currency: string;
    logo: string;
  };
  cardName: string;
  logo: string;
  ownerName: string;
  status: CardStatus;
  type: CardType;
  ownerType: OwnerType;
  showBalance: boolean;
  transitAccount: string;
  expiryDate: string;
  contractNumber: string;
  cardClientId: number;
  success: boolean;
  errorMessage: string;
}

export interface Sort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export type PrepareSalaryCardTransactionRes = {
  transactionId: string[];
  parentId: string;
}
