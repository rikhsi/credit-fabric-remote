import { TableColumn } from '../../../../../shared/interfaces/table.interface';
import {TableButton} from "../../../../../shared/interfaces/table-button.interface";

export const MyDepositsTableColumnsHeaders: TableColumn[] = [
  { header: 'Номер договора', field: 'contractNumber',left:true },
  { header: 'Вид депозита', field: 'depositType' ,left:true},
  { header: 'Дата привлечения', field: 'openDate', left: true },
  { header: 'Дата закрытия', field: 'closingDate', left: true },
  { header: 'Сумма', field: 'amount', right: true, },
  { header: 'Остаток', field: 'depSaldo.amount', right: true, },
  { header: 'Ставка', field: 'percent', right: true, percent: true  },
  { header: 'Валюта', field: 'currency', left: true },
  { header: 'Осталось дней', field: 'remainingDays' },
  { header: 'Статус', field: 'status' },
];

export const LoanScheduleTableColumnsHeaders: TableColumn[] = [
  { header: 'Дата платежа', field: 'repaymentDate' },
  { header: 'Оплата  по графику', field: 'recommendedAmount', right: true },
  { header: 'Основной долг', field: 'amount', right: true },
  { header: 'Проценты', field: 'interestOnTermDebt', right: true },
  { header: 'Остаток кредита', field: 'saldo', right: true },
];
export const DepositsTableActionBtns: TableButton[] = [
  {
    id: 'replenish',
    title: 'Пополнить',
    src: './assets/svg/replenish.svg',
    active: false,
    activeColor: '!text-[#2C3531] cursor-pointer',
  },
  {
    id: 'transaction-history',
    title: 'История',
    src: './assets/svg/history-clock.svg',
    active: false,
    activeColor: '!text-[#2C3531] cursor-pointer',
  },
];
