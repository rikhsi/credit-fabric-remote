export  const   MAIN_COMPONENT_PRODUCTS : { key: TabKey; name: string,translateKey:string  }[] = [
  { key: 'accounts', name: 'Счета',translateKey:"accounts.accounts" },
  { key: 'cards', name: 'Карты', translateKey:"main.cards"},
  { key: 'deposits', name: 'Депозиты',translateKey:"main.deposits" },
  { key: 'credits', name: 'Кредиты',translateKey:"main.loans" },
];

export  const  PAYMENT_TABS : { key: PaymentTabKey; name: string,translateKey:string }[] = [
  { key: 'all', name: 'Все',translateKey:'accountStatements.all' },
  { key: 'signature', name: 'На подпись',translateKey:'myAccounts.for_signature' },
  { key: 'autoPay', name: 'Запланированные' ,translateKey:'createPayment.scheduled'},
];

export  const  CONVERSION_TABS : { key: ConversionKey; name: string,translateKey:string }[] = [
  { key: 'all', name: 'Все',translateKey:'accountStatements.all' },
  { key: 'signature', name: 'На подпись',translateKey:'myAccounts.for_signature' },
  { key: 'under-development', name: 'На доработке' ,translateKey:'new_third.under_development'},
  { key: 'errors', name: 'Ошибка' ,translateKey:'conversion.errors'},
];

export  const  LOAN_TABS : { key: PaymentTabKey; name: string,translateKey:string }[] = [
  { key: 'all', name: 'Все',translateKey:'accountStatements.all' },
  { key: 'signature', name: 'На подпись',translateKey:'myAccounts.for_signature' },
];


export  const  MAIN_PAYMENT_TABS : { key: MainPaymentTabKey; name: string,translateKey:string }[] = [
  { key: 'history', name: 'История' ,translateKey:'myAccounts.history'},
  { key: 'signature', name: 'На подпись' ,translateKey:'myAccounts.for_signature'},
  { key: 'autoPay', name: 'Запланированные',translateKey:'createPayment.scheduled'},
];

export const CREATED_PAYMENTS_TABS:{key:CreatedPaymentsKey,name:string,translateKey:string}[] = [
  {key:'all',name:'Все',translateKey:'accountStatements.all'},
  {key:'signature',name: 'На подпись',translateKey:'myAccounts.for_signature'},
  {key:'under-development',name:'На доработке',translateKey:'new_third.under_development'},
  {key:'creation-errors',name:'Ошибки создания',translateKey:'new_third.creation_errors'},
]
export  const  DEPOSIT_TABS : { key:DepositPaymentsKey ; name: string,translateKey:string }[] = [
  { key: 'all', name: 'Все',translateKey:'accountStatements.all' },
  { key: 'active', name: 'Активные',translateKey:'myAccounts.for_signature' },
];


export type TabKey = 'accounts' | 'cards' | 'deposits' | 'credits';
export type PaymentTabKey = 'all' | 'signature' | 'autoPay';
export type DepositTabKey = 'all' | 'signature' | 'autoPay';

export type MainPaymentTabKey = 'history' | 'signature' | 'autoPay';
export type CreatedPaymentsKey  = 'all' | 'signature' | 'under-development' | 'creation-errors'
export type ConversionKey  = 'all' | 'signature' | 'under-development' | 'errors'
export type DepositPaymentsKey  = 'all'  | 'active'


