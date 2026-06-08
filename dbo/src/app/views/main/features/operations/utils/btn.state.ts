import { TableButton } from '../../../../../shared/interfaces/table-button.interface';

export const tableActionBtns: TableButton[] = [
  {
    id: 'delete',
    title: 'Удалить',
    src: './assets/svg/trash.svg',
    active: false,
    activeColor: 'text-[#FF3333] cursor-pointer',
  },
  {
    id: 'excel',
    title: 'Excel',
    src: './assets/svg/excel.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
  {
    id: 'instruction',
    title: 'Инструкция по заполнению',
    src: './assets/svg/info-circle.svg',
    active: true,
    activeColor: '!text-[#264796] cursor-pointer',
  },
];

export const tableActionCrossBtns: TableButton[] = [
  {
    id: 'delete',
    title: 'Удалить',
    src: './assets/svg/trash.svg',
    active: false,
    activeColor: 'text-[#FF3333] cursor-pointer',
  },

  // {
  //   id: 'currencyPairs',
  //   title: 'Валютные пары',
  //   src: './assets/svg/clipboard-text.svg',
  //   active: true,
  //   activeColor: '!text-[#264796] cursor-pointer',
  // },
  // {
  //   id: 'swift',
  //   title: 'GPI-tracker',
  //   src: './assets/svg/swift.svg',
  //   active: false,
  //   activeColor: 'text-orange-500 cursor-pointer',
  // },
  {
    id: 'print',
    title: 'Печать',
    src: './assets/svg/printer-action.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
  {
    id: 'excel',
    title: 'Excel',
    src: './assets/svg/excel.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
  {
    id: 'instruction',
    title: 'Инструкция по заполнению',
    src: './assets/svg/info-circle.svg',
    active: true,
    activeColor: '!text-[#264796] cursor-pointer',
  },
  {
    id: 'reminder',
    title: 'Памятка',
    src: './assets/svg/task-square.svg',
    active: true,
    activeColor: '!text-[#264796] cursor-pointer',
  }
];
