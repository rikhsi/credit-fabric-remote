import { TableColumn } from '../../../../../shared/interfaces/table.interface';

export const MyLoansTableColumnsHeaders: TableColumn[] = [
  { header: 'Номер договора', field: 'loanId' },
  { header: 'Дата начала', field: 'finMateDate' },
  { header: 'Дата окончания', field: 'closeDate' },
  { header: 'Сумма кредита', field: 'totalAmount.amount', right: true },
  { header: 'Остаток', field: 'fullAmount.amount', right: true },
  { header: 'Валюта', field: 'currency' },
  { header: 'Процентная ставка', field: 'percent', right: true, percent: true  },
  { header: 'Следующий платеж', field: 'repaymentDate' },
  { header: 'Статус', field: 'status' },
];

export const LoanScheduleTableColumnsHeaders: TableColumn[] = [
  { header: 'Дата платежа', field: 'repaymentDate' },
  { header: 'Оплата  по графику', field: 'recommendedAmount', right: true },
  { header: 'Основной долг', field: 'amount', right: true },
  { header: 'Проценты', field: 'interestOnTermDebt', right: true },
  { header: 'Остаток кредита', field: 'saldo', right: true },
];
