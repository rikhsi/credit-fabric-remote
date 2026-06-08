import { TableColumn } from '../../../../../shared/interfaces/table.interface';


export const eptTableColumnsHeaders: TableColumn[] = [
  { header: 'Номер документа', field: 'docNumber', right: true },
  { header: 'Дата документа', field: 'docDate', right: true },
  { header: 'Счёт получателя', field: 'payeeAccount', right: true },
  { header: 'МФО получателя', field: 'payeeBranch', right: true },
  { header: 'Сумма документа', field: 'summa', right: true },
  { header: 'Остаток к оплате', field: 'sumRest', right: true },
  { header: 'Вид требования', field: 'additionalTemplate', left: true },
  { header: 'Статус', field: 'status' },
];

export const recallTableColumns: TableColumn[] = [
  { header: 'Номер требования', field: 'documentId', right: true },
  { header: 'Номер отзыва', field: 'recallId', right: true },
  { header: 'Сумма требования', field: 'sumRecalled', right: true },
  { header: 'Основная сумма', field: 'sumRecalled', right: true },
  { header: 'Статус', field: 'stateId' },
]

export const operationColumns: TableColumn[] = [
  { header: 'Дата', field: 'createdOn' },
  { header: 'Операция', field: 'type' },
  { header: 'Сумма', field: 'resultSum' },
  { header: 'Остаток', field: 'resultSum' },
];
