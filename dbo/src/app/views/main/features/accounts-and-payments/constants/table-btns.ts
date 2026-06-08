import { TableButton } from '../../../../../shared/interfaces/table-button.interface';

export const AccountsTableActionBtns: TableButton[] = [
  {
    id: 'print-account',
    title: 'Печать',
    src: './assets/svg/printer-action.svg',
    active: false,
    activeColor: '!text-[#2C3531] cursor-pointer',
  },
  {
    id: 'excel-account',
    title: 'Excel',
    src: './assets/svg/excel.svg',
    active: false,
    activeColor: '!text-[#2C3531] cursor-pointer',
  },
  {
    id: 'delete-account',
    title: 'Закрытие счета',
    src: './assets/svg/close.svg',
    active: false,
    activeColor: '!text-[#2C3531] cursor-pointer',
  },
];
export const CorpCardsTableActionBtns: TableButton[] = [
  {
    id: 'replenish',
    title: 'Пополнить',
    src: './assets/svg/replenish.svg',
    active: false,
    activeColor: '!text-[#2C3531] cursor-pointer',
  },
  {
    id: 'transaction-history',
    title: 'История операций',
    src: './assets/svg/history-clock.svg',
    active: false,
    activeColor: '!text-[#2C3531] cursor-pointer',
  },
];

export const PaymentTableActionBtns: TableButton[] = [
  {
    id: 'select-count',
    title: 'Выбрано',
    src: '',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
    hideBgColor: true,
  },
  {
    id: 'cancel-payment',
    title: 'Отменить',
    src: './assets/svg/close.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
    hideBgColor: false,
  },
  {
    id: 'edit-payment',
    title: 'Редактировать',
    src: './assets/svg/pencil.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
    hideBgColor: false,
  },
  {
    id: 'send-payment',
    title: 'Отправить на доработку',
    src: './assets/svg/reload.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
    hideBgColor: false,
  },
  {
    id: 'mark-payment',
    title: 'Подписать',
    src: './assets/svg/sign.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
    hideBgColor: false,
  },
];

export const PaymentsTableActionBtns: TableButton[] = [
  {
    id: 'delete-transaction',
    title: 'Удалить',
    src: './assets/svg/trash.svg',
    active: false,
    activeColor: '!text-[#FF3333] cursor-pointer',
  },
  {
    id: 'print-transaction',
    title: 'Печать',
    src: './assets/svg/printer-action.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
  {
    id: 'excel-transaction',
    title: 'Excel',
    src: './assets/svg/excel.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
];
