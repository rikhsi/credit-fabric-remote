import { TableColumn } from '../../../../../shared/interfaces/table.interface';
import {signal} from "@angular/core";

export const AccountsTableColumnsHeaders: TableColumn[] = [
  { header: 'Валюта', field: 'saldo.currency' },
  { header: 'Название счёта', field: 'nameAcc',left:true },
  { header: 'Счёт', field: 'account',left:true },
  { header: 'Остаток', field: 'saldo.amount', right: true },
];
export const CorpCardTransactionHistoryTableColumnsHeaders: TableColumn[] = [
  { header: 'Дата', field: 'date' },
  { header: 'Получатель/Отправитель', field: 'sender',left:true },
  { header: 'Назначение', field: 'purpose',left:true },
  { header: 'Сумма', field: 'amount', right: true },
];
export const CorpCardsTableColumnsHeaders: TableColumn[] = [
  { header: 'Наименование', field: 'name',left:true },
  { header: 'Счет', field: 'account',right:true },
  { header: 'Номер карты', field: 'pan',left:true },
  { header: 'Остаток', field: 'balance',right:true},
  { header: 'Валюта', field: 'balance.currency'},
  { header: 'Статус', field: 'status' },
];

export const PaymentsTableColumnsHeaders: TableColumn[] = [
  { header: 'Номер счета', field: 'sender.account', right: true },
  { header: 'Дата', field: 'docDate', right: true },
  { header: 'Номер', field: 'docNum', right: true },
  { header: 'Контрагент', field: 'recipient.name', left: true },
  { header: 'Счет контрагента', field: 'recipient.account', right: true },
  { header: 'Сумма', field: 'senderAmount', right: true },
  { header: 'Статус', field: 'status' },
]

export const AccountsTableRowsFields = [
  { header: '№ заявления', field: 'applicationId', right: true },
  { header: 'Контрагент', field: 'swiftApplicationDto.beneficiary59', left: true },
  { header: 'Счет плательщика', field: 'swiftApplicationDto.senderAccount', right: true },
  { header: 'Дата', field: 'createdDate', right: true },
  { header: 'Сумма', field: 'swiftApplicationDto.senderAmount32', right: true },
  { header: 'Состояние в банке', field: 'applicationStatus' },
]
export interface CorpCard {
  type: string;
  cardName: string;
  cardNumber: string;
  expire: string;
  amount: number;
  currency: string;
  status: string;
}
