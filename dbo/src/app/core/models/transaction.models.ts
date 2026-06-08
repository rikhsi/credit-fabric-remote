export enum TransactionTypes {
  TRANSACTION = 'TRANSACTION',
  SWIFT = 'SWIFT',
  BUDGET = 'BUDGET',
  BUDGET_INCOME = 'BUDGET_INCOME',
  SALARY = 'SALARY',
  CARD = 'CARD',
  PAYNET = 'PAYNET',
  DEPOSIT_TOP_UP = 'DEPOSIT_TOP_UP',
  DEPOSIT_WITHDRAW = 'DEPOSIT_WITHDRAW',
  LOAN_REPAYMENT = 'LOAN_REPAYMENT',
  LOAN_PRETERM = 'LOAN_PRETERM',
  DEFAULT = 'DEFAULT',
  ACCREDIT = 'ACCREDIT',
  CORP_CARD_TOP_UP = 'CORP_CARD_TOP_UP',
  P2SERVICE = 'P2SERVICE',
  LOAN_CLOSE = 'LOAN_CLOSE',
  CONVERSION_BUY = 'CONVERSION_BUY',
  CONVERSION_SELL = 'CONVERSION_SELL',
  CONVERSION = 'CONVERSION',
  CROSS_CONVERSION = 'CROSS_CONVERSION',
  MUNIS = 'MUNIS',
  // BETWEEN_ACCOUNTS = 'BETWEEN_ACCOUNTS',
}

export function getTransactionTypeTranslation(type: TransactionTypes): string {
  const translations: { [key in TransactionTypes]: string } = {
    [TransactionTypes.TRANSACTION]: 'Транзакция',
    // [TransactionTypes.BETWEEN_ACCOUNTS]: 'Между своими счетами',
    [TransactionTypes.SWIFT]: 'Свифт-перевод',
    [TransactionTypes.BUDGET]: 'Бюджет',
    [TransactionTypes.BUDGET_INCOME]: 'Бюджет доход',
    [TransactionTypes.SALARY]: 'Зарплата',
    [TransactionTypes.CARD]: 'Карта',
    [TransactionTypes.PAYNET]: 'Paynet',
    [TransactionTypes.DEPOSIT_TOP_UP]: 'Пополнение депозита',
    [TransactionTypes.DEPOSIT_WITHDRAW]: 'Вывод депозита',
    [TransactionTypes.LOAN_REPAYMENT]: 'Погашение кредита',
    [TransactionTypes.LOAN_PRETERM]: 'Досрочное погашение кредита',

    [TransactionTypes.DEFAULT]: 'По умолчанию',
    [TransactionTypes.ACCREDIT]: 'Аккредитив',
    [TransactionTypes.CORP_CARD_TOP_UP]: 'Пополнение корпоративной карты',
    [TransactionTypes.P2SERVICE]: 'Оплата услуги',
    [TransactionTypes.LOAN_CLOSE]: 'Закрытие кредита',
    [TransactionTypes.CONVERSION_BUY]: 'Покупка валюты',
    [TransactionTypes.CONVERSION_SELL]: 'Продажа валюты',
    [TransactionTypes.CONVERSION]: 'Конверсия',
    [TransactionTypes.CROSS_CONVERSION]: 'Кросс-конверсия',
    [TransactionTypes.MUNIS]: 'Муниципальный перевод'
  };

  return translations[type] || 'Неизвестный тип';
}
export interface SignRequest {
  id: string;
  hash?: string;
  type: string;
}

export interface SignApplicationRequest {
  sign: string;
  digest: string;
}

export interface SignConfirmRequest {
  sign: string;
  digest: string;
  transactionMode: string;
  confirmCode?: number;
}

export interface SignActionRequest {
  sign: string;
  digest: string;
}
export interface CertificateRequest {
  certificate: string;
  type: 'VIRTUAL' | 'PHYSICAL';
  pinCode: string;
}

export interface ClientDecisionRequest {
  certificates: CertificateRequest[];
}

export interface PasswordChange {
  digest: string;
  hash: string
}

export interface SignConfirmResponse {
  success: boolean
  result: {
    code: number
    message: string
    audit: string
    data: {
      result: []
    }
  }
}

export interface transactionAction {
  actionType: string;
  name: string;
}

export interface ActionsHistoryDTO {
  readonly actionType: string
  readonly at: string;
  readonly by: string
  readonly byId: string
  readonly details: null | string
  readonly id: number
  readonly transactionId: number
}

export type TransactionOneDetailDto = {
  audit: {
    createdBy: string
    createdByName: string
    updatedBy: string
    updatedByName: string
    createdAt: string
    updatedAt: string
  },
  webButtons: {
    name: string,
    carousel: string,
    button: {
      name: string,
      path: string,
    }
  }[]
  statusLogo: {
    contentType: any
    ext: any
    name: string
    path: string
  }
  hasPermissionToSign: boolean,
  transactionUUID?: string,
  statusNameFront?: string
  id: string
  docNum: number;
  name?: string;
  canUserSign: boolean;
  errorMessage: string;
  returnUrl?: string;
  fromAbs: boolean;
  logo?: string;
  lastStatusTime: string;
  buttons: transactionAction[];
  receiverAmount: {
    amount: number
    scale: number
    currency: string
  };
  senderAmount: {
    amount: number
    scale: number
    currency: string
  }
  sender: {
    pinfl: string
    codeFilial: string
    name: string
    tax: string
    account: string;
    bankName: string;
  }
  purpose: {
    code: number
    name: string
    purposeCode: number
  }
  recipient: {
    pinfl: string
    codeFilial: string
    name: string
    tax: string
    account: string;
    bankName: string;
  }
  docDate: string;
  isAutoPay: boolean;
  autoPayCreateReq: {
    paymentFrequency: string;
    months: number[];
    days: number[];
    paymentDay: number;
    paymentTime: string;
    dateEnd: string;
    isAutoSend: boolean;
    withNotification: boolean;
    notificationBeforeTime: number;
  }
  absStatus: string;
  isDebit: boolean;
  status: string;
  isSigned: boolean
  paymentTime: string
  dateEnd: string
  signedList: Array<{
    fullName: string;
    signDate: string | null;
    roleType: string;
    signOrderNumber: number;
    isFinished: boolean,
    status: string;
  }>;
  saldo: {
    amount: number
    scale: number
    currency: string
  }
  type: 106
  transactionMode: string
  additionalInfo?: AdditionalInfo;
  description: string;
  isPreErrorStatusTransactionInMassivePayment?:boolean
}

export type AdditionalInfo = {
  windowType?: string;
  recipientAccount?: string;
  additionalProp3?: string;
  loanId: string;
}
