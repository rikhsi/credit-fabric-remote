export enum ReportType {
  ACCOUNT_ACTIVITY_INFO = 'ACCOUNT_ACTIVITY_INFO',
  WITH_CORRESPONDENT = 'WITH_CORRESPONDENT',
  OPERATING_DAY = 'OPERATING_DAY',

  PERSONAL_ACCOUNT_STATEMENT = 'PERSONAL_ACCOUNT_STATEMENT',
  DOCUMENT_STATEMENT = 'DOCUMENT_STATEMENT',
  TERMINAL_STATEMENT = 'TERMINAL_STATEMENT',
  CURRENCY_OPERATIONS_STATEMENT = 'CURRENCY_OPERATIONS_STATEMENT',

  PAYMENT_DOCUMENTS = 'PAYMENT_DOCUMENTS',

  ACCOUNT_ACTIVITY_CERTIFICATE = 'ACCOUNT_ACTIVITY_CERTIFICATE',
  FIVE_DIGIT_ACCOUNT_CERTIFICATE = 'FIVE_DIGIT_ACCOUNT_CERTIFICATE',
  BANK_STATEMENT_1C = 'BANK_STATEMENT_1C',
  BANK_STATEMENT_MT940 = 'BANK_STATEMENT_MT940',
  ACCOUNT_MOVEMENTS = 'ACCOUNT_MOVEMENTS',

  ACCOUNT_BALANCES = 'ACCOUNT_BALANCES',
  BALANCE_SHEET = 'BALANCE_SHEET',
  CARD_FILE_BALANCES = 'CARD_FILE_BALANCES',

  OUTGOING_PAYMENT_INVENTORY = 'OUTGOING_PAYMENT_INVENTORY',
  PAYMENT_ORDER_REGISTRY = 'PAYMENT_ORDER_REGISTRY',
  MERCHANT_TERMINAL_REGISTRY = 'MERCHANT_TERMINAL_REGISTRY',

  CARD_FILE_1 = 'CARD_FILE_1',
  CARD_FILE_2 = 'CARD_FILE_2',

  CBU_EXCHANGE_RATES = 'CBU_EXCHANGE_RATES'
}

export type ReportTypeKey = keyof typeof ReportType;


export const ReportTypeRu: Record<ReportType, string> = {
  [ReportType.ACCOUNT_ACTIVITY_INFO]: 'Сведения о работе счета',
  [ReportType.WITH_CORRESPONDENT]: 'С корреспондентом',
  [ReportType.OPERATING_DAY]: 'Опердень',

  [ReportType.PERSONAL_ACCOUNT_STATEMENT]: 'Выписка лицевого счета',
  [ReportType.DOCUMENT_STATEMENT]: 'Выписка по документам',
  [ReportType.TERMINAL_STATEMENT]: 'Выписка с терминала',
  [ReportType.CURRENCY_OPERATIONS_STATEMENT]: 'Выписка по валютным операциям',

  [ReportType.PAYMENT_DOCUMENTS]: 'Платежные документы',

  [ReportType.ACCOUNT_ACTIVITY_CERTIFICATE]: 'Справка о работе счета',
  [ReportType.FIVE_DIGIT_ACCOUNT_CERTIFICATE]: 'Справка по 5-значному счету',
  [ReportType.BANK_STATEMENT_1C]: 'Банковская выписка (для 1С)',
  [ReportType.BANK_STATEMENT_MT940]: 'Банковская выписка MT940',
  [ReportType.ACCOUNT_MOVEMENTS]: 'Движение счетов',

  [ReportType.ACCOUNT_BALANCES]: 'Остатки на счетах',
  [ReportType.BALANCE_SHEET]: 'Сальдово-оборотная ведомость',
  [ReportType.CARD_FILE_BALANCES]: 'Остатки счетов Картотеки',

  [ReportType.OUTGOING_PAYMENT_INVENTORY]: 'Опись исходящих платёжных документов',
  [ReportType.PAYMENT_ORDER_REGISTRY]: 'Реестр введённых платёжных поручений',
  [ReportType.MERCHANT_TERMINAL_REGISTRY]: 'Реестр транзакций торговых организаций в разрезе терминалов',

  [ReportType.CARD_FILE_1]: 'Счета на картотеке 1',
  [ReportType.CARD_FILE_2]: 'Счета на картотеке 2',

  [ReportType.CBU_EXCHANGE_RATES]: 'Курсы валют ЦБ РУЗ'
};

