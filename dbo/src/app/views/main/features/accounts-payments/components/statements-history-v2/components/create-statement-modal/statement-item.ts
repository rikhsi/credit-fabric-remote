import { S } from "@angular/material/icon-registry.d-BVwP8t9_";
import { DOCUMENTS_TYPES } from "src/app/shared/types";
import { StatementType } from "src/app/constants";

export interface StatementItem {
  iconType: DOCUMENTS_TYPES;
  title: string;
  subtitle: string;
  route: string;
  type: StatementType;
  value: StatementType;
  label: string
}

export const STATEMENT_ITEMS: StatementItem[] = [
  {
    iconType: 'EXCEL',
    title: 'Выписка по счёту',
    label: 'Выписка по счёту',
    subtitle: 'В формате Excel',
    route: '/charts/create-statement/account',
    type: StatementType.ACCOUNT_STATEMENT,
    value: StatementType.ACCOUNT_STATEMENT
  },
  {
    iconType: 'TXT',
    title: 'Выписка картотек',
    label: 'Выписка картотек',
    subtitle: 'В формате TXT',
    route: '/charts/create-statement/kartotek',
    type: StatementType.KARTOTEK_STATEMENT,
    value: StatementType.KARTOTEK_STATEMENT,
  },
  {
    iconType: 'TXT',
    title: 'Справка о работе счёта',
    label: 'Справка о работе счёта',
    subtitle: 'Excel и TXT',
    route: '/charts/create-statement/account-info',
    type: StatementType.ACCOUNT_INFO,
    value: StatementType.ACCOUNT_INFO,
  },
  {
    iconType: 'TXT',
    title: 'Выписка лицевых счетов',
    label: 'Выписка лицевых счетов',
    subtitle: 'В формате TXT',
    route: '/charts/create-statement/personal-accounts',
    type: StatementType.PERSONAL_ACCOUNT_STATEMENT,
    value: StatementType.PERSONAL_ACCOUNT_STATEMENT,
  },
  {
    iconType: 'TXT',
    title: 'Оборотно-сальдовая ведомость',
    label: 'Оборотно-сальдовая ведомость',
    subtitle: 'В формате TXT',
    route: '/charts/create-statement/turnover',
    type: StatementType.TURNOVER_STATEMENT,
    value: StatementType.TURNOVER_STATEMENT,
  },
  {
    iconType: 'PDF',
    title: 'Платёжные документы',
    label: 'Платёжные документы',
    subtitle: 'PDF со всеми документами',
    route: '/charts/create-statement/payment-documents',
    type: StatementType.PAYMENT_DOCUMENTS,
    value: StatementType.PAYMENT_DOCUMENTS,
  },
  {
    iconType: 'EXCEL',
    title: 'Реестры и описи платежей',
    label: 'Реестры и описи платежей',
    subtitle: 'В формате Excel',
    route: '/charts/create-statement/payment-registers',
    type: StatementType.REGISTERS,
    value: StatementType.REGISTERS,

  },
  {
    iconType: 'TXT',
    title: 'Курсы валют',
    label: 'Курсы валют',
    subtitle: 'Проведённые транзакции по терминалу',
    route: '/charts/create-statement/currency-rates',
    type: StatementType.CURRENCY_RATES,
    value: StatementType.CURRENCY_RATES,
  },
];
