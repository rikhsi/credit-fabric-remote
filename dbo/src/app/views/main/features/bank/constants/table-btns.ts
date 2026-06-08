import { TableButton } from '../../../../../shared/interfaces/table-button.interface';

export const BankTableActions: TableButton[] = [
  {
    id: 'print-bankmail',
    title: 'Печать',
    src: './assets/svg/printer-action.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
  {
    id: 'excel-bankmail',
    title: 'Excel',
    src: './assets/svg/excel.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
  {
    id: 'file-bankmail',
    title: 'Отзывы',
    src: './assets/svg/File_Document.svg',
    active: true,
    activeColor: '!text-[#264796] cursor-pointer',
    bgColor: '!bg-[#DDECFC]',
  },
];

export const RecallTableActions: TableButton[] = [
  {
    id: 'print-bankmail',
    title: 'Печать',
    src: './assets/svg/printer-action.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
  {
    id: 'excel-bankmail',
    title: 'Excel',
    src: './assets/svg/excel.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
];
