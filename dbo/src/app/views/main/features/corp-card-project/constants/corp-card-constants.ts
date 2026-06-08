import { ICONS_TYPE } from "src/app/shared/types";

export const bankCards = [
  { label: 'accounts.all', type: 'ALL', },
  { label: 'Uzcard', type: 'UZCARD', img: 'assets/new-icons/bank-cards/uzcard.svg' },
  { label: 'Humo', type: 'HUMO', img: 'assets/new-icons/bank-cards/humo.svg' },
  { label: 'Visa', type: 'VISA', img: 'assets/new-icons/bank-cards/visa.svg' },
];


export const currencies = [
  { code: 'UZS', flag: 'assets/new-icons/uzb.svg' },
];


export const statusList = [
  { label: "accounts.active", type: "ACTIVE", img: "assets/new-icons/done-status.svg" },
  { label: "accounts.blocked", type: "BLOCKED", img: "assets/new-icons/blocked-icon.svg" },
  { label: "accounts.expired", type: "EXPIRED", img: "assets/new-icons/bank-cards/exclamation.svg" },
]


export const detailStatuses = [
  { label: "accounts.active", type: "ACTIVE", img: "assets/new-icons/bank-cards/tick.svg" },
  { label: "accounts.blocked", type: "BLOCKED", img: "assets/new-icons/bank-cards/exclamation.svg" },
  // { label: "accounts.expired", type: "EXPIRED", img: "assets/new-icons/bank-cards/exs.svg" },
]


export const detailBankCards = [
  { type: "UZCARD", img: "/assets/new-icons/bank-cards/white-uzcard.svg" },
  { type: "HUMO", img: "assets/new-icons/bank-cards/humo-logo.svg" },
  { type: 'VISA', img: 'assets/new-icons/bank-cards/visa-logo.svg' },
]



export const TransactionHistoryTabs: { key: string; name: string, translateKey: string }[] = [
  { key: 'history', name: 'История', translateKey: 'accountStatements.all' },
  { key: 'signature', name: 'На подпись', translateKey: 'myAccounts.for_signature' },
];

export const Trancations = [
  { label: 'Все', type: 'ALL', },
  { label: 'Исходящие', type: 'OUTCOME', img: 'assets/new-icons/send-icon.svg' },
  { label: 'Входящие', type: 'INCOME', img: 'assets/new-icons/receipt-arrow.svg' },
]


export const periods = [
  { label: "accounts.daily", type: 0, status: "DAILY" },
  { label: "accounts.monthly", type: 3, status: "MONTHLY" },
  { label: "accounts.custom", type: 1, status: "CUSTOM" },
]

export const customPeriods = [
  { label: "accounts.custom", type: 0 },
  { label: "accounts.monthly", type: 3 },
]


export const categories = [
  { label: "Транзакции через POS", type: 40 },
]


//  actionButtons = <{ title: string, icon: any, action: string }[]>([
//   {
//     action: 'sign',
//     icon: './assets/new-icons/sign-02.svg',
//     // icon: 'hamkor_subscribe_pen',
//     title: 'accounts.sign'
//   },
//   {
//     action: 'edit',
//     icon: './assets/new-icons/reverse-right.svg',
//     // icon: 'hamkor_edit',
//     title: 'main.retry_alt'
//   },
//   {
//     action: 'delete',
//     icon: './assets/new-icons/trash.svg',
//     // icon: 'hamkor_delete',
//     title: 'salaryStatements.delete'
//   },
// ])


export const actionButtons = <{ title: string; icon: ICONS_TYPE; action: string, titleTranslateKey: string }[]>([
  { action: 'sign', icon: 'hamkor_subscribe_pen', title: 'Подписать', titleTranslateKey: 'createPayment.sign' },
  { action: 'reverse', icon: 'hamkor_reverse_right', title: 'Повторить', titleTranslateKey: 'accountStatements.retry' },
  { action: 'edit', icon: 'hamkor_edit', title: 'Редактировать', titleTranslateKey: 'createPayment.edit' },
  { action: 'delete', icon: 'hamkor_delete', title: 'Удалить', titleTranslateKey: 'createPayment.delete' },
]);

