import {AppReportParentDTO} from "../shared/interfaces/applications.interface";

export const ReportTypes: AppReportParentDTO[] = [
  {
    value: 'account-activity',
    description: 'accountStatements.account_activity_details', // 'Сведения о работе счета',
    enabled: true,
    fileTypeDescription: "",
    fileTypeList: [],
    child: [
      {value: 'account-activity', description: 'Сведения о работе счета', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'account-activity-with-counterparty', description: 'С корреспондентом', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'account-activity-operational-day', description: 'Опердень', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
    ],
  },
  {
    value: 'personal-account-statement',
    description: 'accountStatements.personal_account_statement', // 'Выписка лицевого счета',
    enabled: true,
    fileTypeDescription: "",
    fileTypeList: [],
    child: [
      {value: 'personal-account-statement', description: 'Выписка лицевого счета', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'document-statement', description: 'Выписка по документам', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'document-statement-terminal', description: 'Выписка с терминала', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'document-statement-currency', description: 'Выписка по валютным операциям', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
    ],
  },
  {
    value: 'payment-documents-for-period',
    description: 'accountStatements.payment_documents', // 'Платежные документы',
    enabled: true,
    fileTypeDescription: "",
    fileTypeList: [],
    child: [
      {value: 'payment-documents-for-period', description: 'Платежные документы', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      // {value: 'payment-documents-for-period-for-print', description: 'Платежные документы (на печать)', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
    ],
  },
  {
    value: 'account-statement',
    description: 'accountStatements.account_state_and_acc_cert', // 'Выписки и справки по счету',
    enabled: true,
    fileTypeDescription: "",
    fileTypeList: [],
    child: [
      {value: 'account-statement', description: 'Справка о работе счета', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'account-statement-5digit', description: 'Справка по 5-значному счету', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'document-statement-1c', description: 'Банковская выписка (для 1С)', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'bank-statement-mt940', description: 'Банковская выписка MT940', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'account-transactions', description: 'Движение счетов', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
    ],
  },
  {
    value: 'account-balances',
    description: 'accountStatements.balances_and_rem_amounts', // 'Остатки и сальдо',
    enabled: true,
    fileTypeDescription: "",
    fileTypeList: [],
    child: [
      {value: 'account-balances', description: 'Остатки на счетах', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'trial-balance-sheet', description: 'Сальдово-оборотная ведомость', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'card-index-accounts-balances', description: 'Остатки счетов Картотеки', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
    ],
  },
  {
    value: 'outgoing-payment-documents-list',
    description: 'accountStatements.payment_registers_and_lists', // 'Реестры и описи платежей',
    enabled: true,
    fileTypeDescription: "",
    fileTypeList: [],
    child: [
      {value: 'outgoing-payment-documents-list', description: 'Опись исходящих платежных документов', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'entered-payment-orders-register', description: 'Реестр введённых платёжных поручений', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
    ],
  },
  {
    value: 'file1-accounts',
    description: 'main.card_index', // 'Картотека',
    enabled: true,
    fileTypeDescription: "",
    fileTypeList: [],
    child: [
      {value: 'file1-accounts', description: 'Счета на картотеке 1', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
      {value: 'file2-accounts', description: 'Счета на картотеке 2', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
    ],
  },
  {
    value: 'exchange-rates',
    description: 'accountStatements.currency_rates', // 'Курсы валют',
    enabled: true,
    fileTypeDescription: "",
    fileTypeList: [],
    child: [
      {value: 'exchange-rates', description: 'Курсы валют ЦБ РУЗ', enabled: true, fileTypeDescription: "", fileTypeList: [], child: []},
    ],
  },
];
