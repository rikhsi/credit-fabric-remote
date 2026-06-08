import {TableColumn} from '../../../../../shared/interfaces/table.interface';
import {KeyValue} from "../models/payroll-project.type";

export const EmployeesTableColumnsHeaders: TableColumn[] = [
  {header: 'Номер договора', field: 'contractNumber', left: true },
  {header: 'Счет договора', field: 'transitAccount', right: true },
  {header: 'Количество карт', field: 'count', right: true },
  {header: 'Тип зарплатного проекта', field: 'type', left: true },
]
export const CorpCardTableColumnsHeaders: TableColumn[] = [
  {header: 'Номер договора', field: 'contractNumber', left: true },
  {header: 'Валюта', field: 'currency', left: true },
  {header: 'Счет договора', field: 'transitAccount', right: true },
  {header: 'Количество карт', field: 'count', right: true },
  {header: 'Тип карты', field: 'type', left: true },
]

export const RosterTableColumnsHeaders: TableColumn[] = [
  {header: 'Тип пополнения', field: 'name', left: true },
  {header: 'Номер Ведомости', field: 'type', right: true },
  {header: 'Дата', field: 'docDate', right: true },
  {header: 'Месяц', field: 'month', left: true },
  {header: 'Год', field: 'year', right: true },
  {header: 'Сумма', field: 'amount', right: true },
  {header: 'Статус', field: 'status'},
]
export const RosterCardsTableColumnsHeaders: TableColumn[] = [
  {header: 'Картодержатель', field: 'recipient.name', left: true },
  {header: 'Номер карты', field: 'formattedCardNumber', right: true },
  {header: 'Сумма', field: 'amount', right: true },
  {header: 'Статус', field: 'status', },
]

export const EmployeeCardsTableColumnsHeaders: TableColumn[] = [
  {header: 'Картодержатель', field: 'ownerName', left: true },
  {header: 'Номер карты', field: 'pan', right: true },
  {header: 'Срок действия', field: 'expiryDate', right: true },
  {header: 'Статус', field: 'status'},
]
export const CorpCardsTableColumnsHeaders: TableColumn[] = [
  {header: 'Картодержатель', field: 'ownerName', left: true },
  {header: 'Номер карты', field: 'pan', right: true },
  {header: 'Срок действия', field: 'expiryDate', right: true },
  {header: 'Остаток', field: 'balance', right: true },
  {header: 'Статус', field: 'status'},
]
export const EmployeePendingCardsTableColumnsHeaders: TableColumn[] = [
  {header: 'Картодержатель', field: 'employeeName', left: true },
  {header: 'Серия и номер паспорта', field: 'passportInformation', left: true },
  {header: 'Номер телефона', field: 'phone', right: true },
  {header: 'Тип карты', field: 'cardType', left: true },
  {header: 'Статус', field: 'status'},
]
export const SalaryTypeCardValues: KeyValue[] = [
  {key: 'Все', value: 'UNKNOWN'},
  {key: 'Uzcard', value: 'UZCARD'},
  // { key: 'Uzcard Mastercard', value: 'UZCARD_MASTERCARD' },
  // { key: 'Uzcard Mir', value: 'UZCARD_MIR' },
  // { key: 'Uzcard UnionPay', value: 'UZCARD_UNIONPAY' },
  // { key: 'Uzcard Duo', value: 'UZCARD_DUO' },
  {key: 'Humo', value: 'HUMO'},
  // { key: 'Humo Visa', value: 'HUMO_VISA' },
  // { key: 'Humo Mastercard', value: 'HUMO_MASTERCARD' },
  // { key: 'Visa', value: 'VISA' },
  // { key: 'Mastercard', value: 'MASTERCARD' },
  // { key: 'Wallet', value: 'WALLET' },
  // { key: 'Paynet', value: 'PAYNET' },
  // { key: 'Munis', value: 'MUNIS' },
  // { key: 'Uzasbo Student', value: 'UZASBO_STUDENT' },
  // { key: 'Uzasbo Child', value: 'UZASBO_CHILD' },
  // { key: 'International Exam', value: 'INTERNATIONAL_EXAM' },
  // { key: 'Account', value: 'ACCOUNT' },
]

export const formatMonth = (month: string | undefined): string | undefined => {
  switch (month) {
    case "1":
      return "Январь";
    case "2":
      return "Февраль";
    case "3":
      return "Март";
    case "4":
      return "Апрель";
    case "5":
      return "Май";
    case "6":
      return "Июнь";
    case "7":
      return "Июль";
    case "8":
      return "Август";
    case "9":
      return "Сентябрь";
    case "10":
      return "Октябрь";
    case "11":
      return "Ноябрь";
    case "12":
      return "Декабрь";
  }
  return month
}
