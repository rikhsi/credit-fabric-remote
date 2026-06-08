
export type Status = 'ACTIVE' | 'BLOCKED';
export type CardType = 'UZCARD' | 'HUMO' | 'VISA';
export type Currency = 'USD' | 'UZS' | 'RUB' | 'EUR';

export type FilterKeys =
  | 'searchText'
  | 'type'
  | 'currency'
  | 'status';

export type FilterHistoryKeys =
  | 'isCredit'
  | 'startDate'
  | 'endDate'
  | 'period'
  | 'searchText'
  | 'fromAmount'
  | 'toAmount'
  | 'status';


export interface FilterFormValue {
  searchText: string | null;
  type: CardType | null;
  currency: Currency | null;
  status: Status | null;
}


export interface CardTotalBalanceRequest {
  cardUuid?: string;
  page?: number;
  size?: number;
  type?: "UNKNOWN" | string;
  status?: string;
  userType?: "UNKNOWN" | string;
  updateBalance?: boolean;
  currency?: string;
  transitAccount?: string;
  contractNumber?: string;
  startDate?: string;
  endDate?: string;
  cardHolder?: string;
  cardNumber?: string;
  searchText?: string;
}


