import {AccountsDto} from "../../accounts-payments/models/accounts-payments.model";

export interface DepositDto {
  content: DepositContent[]
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: string;
  size: number;
  sort: { empty: true; sorted: boolean; unsorted: true };
  totalElements: number;
  totalPages: number;
}

export interface DepositDetailsDto {
  depositName: string
  depositor: string
  purpose: string
  minAmount: number
  maxAmount: number
  additionalFunding: string
  minDate: string
  depositPercent: string
  currency: string
  depositForm: string
  rule: string
  earlyReturnRule: string
  depositCode: number
  id: number
  attachmentId: number
  imagePath:string
  lang: string
  depositStatus: string
  additionalText:string
  period: string

}

export interface WithdrawRequest {
  docNum: string;
  docDate: string;
  amount: number;
  currency: string;
  accountNumber: number;
  arrangementId: string;
  depositAccount: string;
}

export type DepositContent = {
  depositName: string
  depositor: string
  purpose: string
  minAmount: number
  additionalFunding: boolean
  minDate: string
  depositPercent: string
  currency: string
  depositForm: string
  rule: string
  earlyReturnRule: string
  depositCode: string
  id: string
  attachmentId: number
  imagePath: string
  lang: string
  additionalText:string
  period:number
}
export type MyDepositsDto = {
  clientName: string
  filialName: string
  description: string
  accountPercent: string
  prolongation: string
  percent: number
  replenishment: string
  depTemp: string
  localCode: string
  prolongationSign: string
  isMobile: string
  earlyTermination: string
  amount: number
  sumDep: number
  inventoryDate: string
  partialWrite: string
  closingDate:string
  depName: string
  savDepId: number
  codeFilial: string
  capitalization: number
  clientCode: number
  prolongationDate: string
  persSum: number;
  openDate: string
  currency: string
  currencyCode: string
  account: string
  status: string
  contractNumber:string
  depSaldo: {
    amount: number,
    currency: string;
    scale: number;
  };
  percSaldo: {
    amount: number,
    currency: string;
    scale: number;
  };
  percentRate: number
  state: string

}
export type accountDepositsDto = {
  deposits:AccountsDto[]
}

export interface DepositSelectListDTO {
  currencyListObj: {
    currency: string;
    logo: { contentType: string; path: string; name: string; ext: string };
  }[];
  depositTypes: {
    code: string;
    title: string;
    logo: { contentType: string; path: string; name: string; ext: string };
  }[];
}

export interface DepositItemDTO {
  account: string;
  accrdint: {
    amount: number;
    currency: string;
    logo: {
      name: string;
      path: string;
    };
    scale: number;
  };
  capitalization: number;
  clientId: string;
  codeFilial?: string;
  contractDate: string;
  contractId: number;
  contractNumber: string;
  createdAt: string;
  currency: {
    currency: string;
    logo: {
      name: string;
      path: string;
    };
  };
  depSaldo: {
    amount: number;
    currency: string;
    logo: {
      name: string;
      path: string;
    };
  };
  endDate: string;
  hasPinned: boolean;
  id: string;
  month: number;
  name: string;
  percSaldo: number;
  percent: number;
  percentRate: {
    dateValidate: string;
    percentRate: number;
  }[];
  pinnedOrder: number | null;
  state: string;
  stateLogo: {
    name: string;
    path: string;
  };
  stateName: string;
  summa: {
    amount: number;
    currency: string;
    logo: {
      name: string;
      path: string;
    };
  };
  takeTax: string;
}
