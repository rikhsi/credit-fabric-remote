export interface ITransactionDetailResponse {
  docNum: string;
  receiverAmount: {
    amount: number;
    scale: number;
    currency: string;
  };
  senderAmount: {
    amount: number;
    scale: number;
    currency: string;
  };
  sender: {
    pinfl: string;
    codeFilial: string;
    name: string;
    tax: string;
    account: string;
  };
  purpose: {
    code: string;
    purposeCode: string;
    name: string;
  };
  recipient: {
    pinfl: string;
    codeFilial: string;
    name: string;
    tax: string;
    account: string;
  };
  externalId: string;
  docDate: string;
  absStatus: string;
  status: string;
  isSigned: boolean;
  signedList: Array<{
    username: string;
    signDate: string;
    isSigned: boolean;
    roleType: string;
  }>;
  type: string;
  transactionMode: string;
  additionalInfo: {
    additionalProp1: string;
    additionalProp2: string;
    additionalProp3: string;
  };
}


export enum paymentEnum {
  NEW = 'NEW',
  SAVED = 'SAVED',
  AUTO_PAY = 'AUTO_PAY',
  PREPARE = 'PREPARE',
  SIGN = 'SIGN',
  PENDING = 'PENDING',
  REVERTED = 'REVERTED',
  SUCCESS = 'SUCCESS',
  COMPLETED_SUCCESS = 'COMPLETED_SUCCESS',
  COMPLETED = 'COMPLETED',
  DELETED = 'DELETED',
  COMPLETED_ERROR = 'COMPLETED_ERROR',
  CANCEL = 'CANCEL',
  ERROR = 'ERROR'
}

export const paymentMapNew = {
  'PREPARE': 'story.pending_signature',
  'SUCCESS': 'story.completed',
  'COMPLETED': 'Выполнен',
  'CANCEL': 'Откленен',
  'ERROR': 'story.error',
  'AUTO_PAY': 'myAccounts.planned',
  'SAVED': 'story.planned',
  'IN_PROCESS': 'story.in_progress',
  'PAYED': 'story.credited',
  'REVERTED': 'main.needs_revision',
  'DELETED_BY_BANK': 'myAccounts.deleted_by_bank'
}

export const paymentMap = {
  [paymentEnum.NEW]: 'Новый',
  [paymentEnum.PREPARE]: 'Создан',
  [paymentEnum.SAVED]: 'Шаблон',
  [paymentEnum.AUTO_PAY]: 'Автоплатёж',
  [paymentEnum.SIGN]: 'Подписание',
  [paymentEnum.PENDING]: 'story.in_progress',
  [paymentEnum.REVERTED]: 'main.needs_revision',
  [paymentEnum.SUCCESS]: 'myAccounts.completed_alt',
  [paymentEnum.COMPLETED_SUCCESS]: 'Успегно завершён',
  [paymentEnum.COMPLETED]: 'Завершён',
  [paymentEnum.DELETED]: 'Удалён',
  [paymentEnum.COMPLETED_ERROR]: 'Завершён с ошибкой',
  [paymentEnum.CANCEL]: 'Отменён',
  [paymentEnum.ERROR]: 'story.error',
}

export const statusesList = [
  paymentEnum.PREPARE,
  paymentEnum.SIGN,
  paymentEnum.REVERTED,
  paymentEnum.SUCCESS,
  paymentEnum.ERROR
]


export const statusListToMap = [
  { name: "Проведен", value: "SUCCESS", img: "https://filecorp-dev.hamkorbank.uz/static/status/no_background/only_icons/svg/out.svg" ,nameKey:'story.completed'},
  { name: "На подпись", value: "PREPARE", img: "https://filecorp-dev.hamkorbank.uz/static/status/no_background/only_icons/svg/edit.svg",nameKey:'story.pending_signature' },
  { name: "В обработке", value: "IN_PROCESS", img: "https://filecorp-dev.hamkorbank.uz/static/status/no_background/only_icons/svg/progress.svg" ,nameKey:'story.in_progress'},
  { name: "Запланирован", value: "AUTO_PAY", img: "https://filecorp-dev.hamkorbank.uz/static/status/no_background/only_icons/svg/pending.svg" ,nameKey:'story.planned'},
  { name: "На доработке", value: "REVERTED", img: "./assets/new-icons/revision-status.svg",nameKey:'story.in_revision' },
  { name: "Ошибка", value: "ERROR", img: "https://filecorp-dev.hamkorbank.uz/static/status/no_background/only_icons/svg/attention.svg" , nameKey:'story.error'},
  { name: "Зачислено", value: "PAYED", img: "./assets/new-icons/done-status.svg",nameKey:'story.credited' },
  { name: "Удален банком", value: "DELETED_BY_BANK", img: "./assets/new-icons/error-status.svg",nameKey:'myAccounts.deleted_by_bank' },
  { name: "Отменен", value: "CANCEL", img: "https://filecorp-dev.hamkorbank.uz/static/status/no_background/only_icons/svg/cancel.svg",nameKey:'myAccounts.canceled' },

]

export const massPaymentTableFilterStatusListToMap = [
  { name: "Проведен", value: "SUCCESS", img: "https://filecorp-dev.hamkorbank.uz/static/status/no_background/only_icons/svg/out.svg" ,nameKey:'story.completed'},
  { name: "Ошибка", value: "ERROR", img: "https://filecorp-dev.hamkorbank.uz/static/status/no_background/only_icons/svg/attention.svg" , nameKey:'story.error'},
  { name: "В ожидании", value: "PENDING", img: "https://filecorp-dev.hamkorbank.uz/static/status/no_background/only_icons/svg/pending.svg" , nameKey:'new_third.pending'},

]