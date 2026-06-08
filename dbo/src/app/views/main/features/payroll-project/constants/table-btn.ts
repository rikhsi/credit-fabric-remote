import { TableButton } from '../../../../../shared/interfaces/table-button.interface';
import {KeyValue} from "../models/payroll-project.type";

export const emplayeesTableButton: TableButton[] = [
  {
    id: 'print-employee-agreements',
    title: 'Печать',
    src: './assets/svg/printer-action.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
  {
    id: 'excel-employee-agreements',
    title: 'Excel',
    src: './assets/svg/excel.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
]

export const rosterTableButton: TableButton[] = [
  {
    id: 'edit-roster-employee',
    title: 'Редактировать',
    src: './assets/svg/edit-pencil.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
  {
    id: 'delete-roster',
    title: 'Удалить',
    src: './assets/svg/trash-full.svg',
    active: false,
    activeColor: '!text-[#FF3333] cursor-pointer',
  },
]

export const rosterCardTableButton: TableButton[] = [
  {
    id: 'exclude-roster-card',
    title: 'Исключить',
    src: './assets/svg/user-close.svg',
    active: false,
    activeColor: '!text-[#264796] cursor-pointer',
  },
  // {
  //   id: 'edit-roster-card',
  //   title: 'Редактировать',
  //   src: './assets/svg/edit-pencil.svg',
  //   active: false,
  //   activeColor: '!text-[#264796] cursor-pointer',
  // },
  {
    id: 'delete-roster-card',
    title: 'Удалить',
    src: './assets/svg/trash-full.svg',
    active: false,
    activeColor: '!text-[#FF3333] cursor-pointer',
  },
]


export const employeesCardsTableButton: TableButton[] = [
  // {
  //   id: 'create-new-employee-card',
  //   title: 'Выпустить новую карту',
  //   src: './assets/svg/add.svg',
  //   active: true,
  //   activeColor: '!text-[#264796] cursor-pointer',
  //   bgColor:'bg-[#ddecfc]'
  // },
  {
    id: 'add-employee-roaster',
    title: 'Создать реестр',
    src: './assets/svg/file-add.svg',
    active: true,
    activeColor: '!text-[#008C79] cursor-pointer',
    bgColor:'bg-[#ddecfc]'
  },
  {
    id: 'upload-employee-roaster',
    title: 'Загрузить свой реестр',
    src: './assets/svg/file-upload.svg',
    active: true,
    activeColor: '!text-[#008C79] cursor-pointer',
    bgColor:'bg-[#ddecfc]'
  },
  {
    id: 'exclude-employee',
    title: 'Исключить',
    src: './assets/svg/user-close.svg',
    active: false,
    activeColor: '!text-[#008C79] cursor-pointer',
  }
]
export const MonthsForSalary:{key:string,value:number}[]=[
  {key: 'Январь', value: 1},
  {key: 'Февраль', value: 2},
  {key: 'Март', value: 3},
  {key: 'Апрель', value: 4},
  {key: 'Май', value: 5},
  {key: 'Июнь', value: 6},
  {key: 'Июль', value: 7},
  {key: 'Август', value: 8},
  {key: 'Сентябрь', value: 9},
  {key: 'Октябрь', value: 10},
  {key: 'Ноябрь', value: 11},
  {key: 'Декабрь', value: 12}]
