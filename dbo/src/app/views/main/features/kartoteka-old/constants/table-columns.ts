import { TableColumn } from '../../../../../shared/interfaces/table.interface';

export const Kartoteka2TableColumnsHeaders: TableColumn[] = [
  { header: 'Номер документа', field: 'docNum', right: true },
  { header: 'Дата документа', field: 'docDate', right: true },
  { header: 'Дата ввода', field: 'dateEnter', right: true },
  { header: 'Остаток', field: 'sumSaldo', right: true },
  { header: 'Сумма документа', field: 'sumDoc', right: true },
  { header: 'Счёт получателя', field: 'coAcc', right: true },
  { header: 'Код картотеки', field: 'purposeCode', right: true },
  { header: 'МФО получателя', field: 'coMfo', right: true },
  { header: 'Статус', field: 'state' },
];

export const Kartoteka1TableColumnsHeaders: TableColumn[] = [
  { header: 'Номер документа', field: 'docNum', right: true },
  { header: 'Дата документа', field: 'docDate', right: true },
  { header: 'Дата ввода', field: 'dateEnter', right: true },
  { header: 'Остаток', field: 'sumSaldo', right: true },
  { header: 'Сумма документа', field: 'sumDoc', right: true },
  { header: 'Счёт получателя', field: 'coAcc', right: true },
  { header: 'Код картотеки', field: 'purposeCode', right: true },
  { header: 'МФО получателя', field: 'coMfo', right: true },
  { header: 'Статус', field: 'state' },
];

export const BookingTableColumns: TableColumn[] = [
  { header: 'Номер документа', field: 'docNum' },
  { header: 'Дата', field: 'docDate' },
  { header: 'Дата завершения', field: 'period' },
  { header: 'Сумма', field: 'sumDoc' },
  { header: 'Накопления', field: 'sumReserved' },
  { header: 'К выдаче', field: 'sumPaid' },
  { header: 'Запрлатный период', field: 'period' },
  { header: 'Статус', field: 'state' },
];

export const AmbulanceTableColumns: TableColumn[] = [
  { header: 'Номер документа', field: 'docNum' },
  { header: 'Дата ввода', field: 'dateAct' },
  { header: 'Дата завершения', field: 'dateDeact' },
  { header: 'Сумма', field: 'sumNeed' },
  { header: 'Накопления', field: 'sumNeedPay' },
  { header: 'К выдаче', field: 'sumNeedPaid' },
  { header: 'Остаток', field: 'issue' },
  { header: 'Статус', field: 'state' },
];


export const bookingOperationColumns: TableColumn[] = [
  { header: 'Дата', field: 'createdOn' },
  { header: 'Операция', field: 'type' },
  { header: 'Сумма', field: 'resultSum' },
  { header: 'Остаток', field: 'resultSum' },
];
