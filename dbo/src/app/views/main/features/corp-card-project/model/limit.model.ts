// Limit Info
export interface LimitInfo {
  uuid: string;
  limitId: number;
  amount: MoneyAmount;
  usedAmount: MoneyAmount;
  cycleType: 0 | 3 | undefined;
  cycleLen: number;
  startDate: string;
  endDate: string;
  isNotification: boolean;
  isActive: boolean;
  isCustomLimit: boolean;
  usedPercent: number;
  fio: string;
  roleName: string;
  updatedAt: string
}


export interface MoneyAmount {
  amount: number;
  scale: number;
  currency: string;
  logo: string;
}

// Limit Categories

export interface LimitCategory {
  limitId: number;
  name: string;
}

export interface LimitCategoryList {
  result: LimitCategory[];
}

// Limit Actions Request

export interface LimitActionsRequest {
  cardUuid: string | null;
  limitId: number | null;
  amount: number | null;
  cycleType: 0 | 3;
  startDate: string | null;
  customer?: "EDIT" | "CREATE"
  endDate: string | null;
  isNotification: boolean | null;
}


