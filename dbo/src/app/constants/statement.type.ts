export enum StatementType {
  ACCOUNT_STATEMENT = 'ACCOUNT_MOVEMENTS',        // Выписка по счёту
  KARTOTEK_STATEMENT = 'CARD_FILE_1',      // Выписка картотек
  ACCOUNT_INFO = 'ACCOUNT_ACTIVITY_CERTIFICATE',                  // Справка о работе счёта
  PERSONAL_ACCOUNT_STATEMENT = 'PERSONAL_ACCOUNT_STATEMENT', // Выписка лицевых счетов
  TURNOVER_STATEMENT = 'BALANCE_SHEET',      // Оборотно-сальдовая ведомость
  PAYMENT_DOCUMENTS = 'PAYMENT_DOCUMENTS',        // Платёжные документы
  REGISTERS = 'PAYMENT_ORDER_REGISTRY',                        // Реестры и описи платежей
  CURRENCY_RATES = 'CBU_EXCHANGE_RATES',              // Курсы валют
}

export enum StatementTypeRouteUrl {
  ACCOUNT_STATEMENT = 'account',// Выписка по счёту
  KARTOTEK_STATEMENT = 'kartotek',// Выписка картотек
  ACCOUNT_INFO = 'account-info',// Справка о работе счёта
  PERSONAL_ACCOUNT_STATEMENT = 'personal-accounts', // Выписка лицевых счетов
  TURNOVER_STATEMENT = 'turnover', // Оборотно-сальдовая ведомость
  PAYMENT_DOCUMENTS = 'payment-documents',  // Платёжные документы
  REGISTERS = 'payment-registers',// Реестры и описи платежей
  CURRENCY_RATES = 'currency-rates', // Курсы валют
}


export enum ReportFrequencyEnum {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ONE_TIME = 'ONE_TIME',
}


export const REPORT_FREQUENCY_OPTIONS = [
  { label: 'Каждый день', value: ReportFrequencyEnum.DAILY },
  { label: 'Раз в неделю', value: ReportFrequencyEnum.WEEKLY },
  { label: 'Раз в месяц', value: ReportFrequencyEnum.MONTHLY },
  { label: 'Разовая выписка', value: ReportFrequencyEnum.ONE_TIME },
];

