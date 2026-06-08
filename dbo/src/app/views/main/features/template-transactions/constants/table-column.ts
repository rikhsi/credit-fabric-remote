import { TableColumn } from '../../../../../shared/interfaces/table.interface';

export const TemplatesTableColumnsHeaders: TableColumn[] = [
  { header: 'Наименование', field: 'name' },
  { header: 'Контрагент', field: 'recipientName' },
  { header: 'Счет контрагента', field: 'recipientAccount' },
  { header: 'Плательщик', field: 'senderName' },
  { header: 'Счет плательщика', field: 'senderAccount' },
];

export const TemplatesTableColumnsBudgetHeaders: TableColumn[] = [
  { header: 'Наименование', field: 'name' },
  { header: 'Контрагент', field: 'budgetName' },
  { header: 'Счет контрагента', field: 'budgetAccount' },
  { header: 'Счет плательщика', field: 'senderAccount' },
  { header: 'Назначение', field: 'purpose' },
];

export const AutoPaymentsTableColumnsHeaders: TableColumn[] = [
  { header: 'Наименование', field: 'transaction.name', left: true },
  { header: 'Контрагент', field: 'transaction.recipient.name', left: true },
  { header: 'Сумма', field: 'transaction.senderAmount.amount', right: true },
  { header: 'Валюта', field: 'transaction.senderAmount.currency' },
  { header: 'Периодичность', field: 'paymentFrequencyTitle' },
  { header: 'Дата отключения автоплатежа ', field: 'dateEnd' },
];
