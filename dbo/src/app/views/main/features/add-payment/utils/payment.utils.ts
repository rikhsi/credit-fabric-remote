export const PAYMENT_HEADER_TYPES:{img:string,name:string, link: string, query: any,translateKey:string}[]= [
  {
    img:'./assets/new-icons/file-05.svg',
    name:'Шаблоны',
    link: '/templates',
    query: { },
    translateKey:'createPayment.templates'
  },
  {
    img:'./assets/new-icons/waste-time.svg',
    name:'Запланированные',
    link: '/history',
    query: { tab: 'autoPay' },
    translateKey:"createPayment.scheduled"
  },
  {
    img:'./assets/new-icons/file-upload.svg',
    name:'Массовая загрузка',
    link: '/payment/mass-payments',
    query: {},
    translateKey:"new_third.massPayments"
  }
]
export const PAYMENT_ACTIONS: { title: string; link: string; text: string; img: string ,titleTranslateKey:string,textTranslateKey:string, mode: string}[] = [
  {
    title: 'На счёт',
    text: 'В любой банк Узбекистана',
    link: 'transfer-to-account',
    img: './assets/new-icons/Shape.svg',
    titleTranslateKey:'createPayment.to_account',
    textTranslateKey:'createPayment.to_any_bank_uzbekistan',
    mode: "TRANSACTION",
  },
  {
    title: 'На карту',
    text: 'Перевод на карту любого банка',
    link: 'transfer-to-card',
    img: './assets/new-icons/credit-card-02.svg',
    titleTranslateKey:'createPayment.to_card',
    textTranslateKey:'createPayment.transfer_to_any_bank_card',
    mode: "TO_PHYSICAL_CARD",
  },
  {
    title: 'На корпоративную карту',
    text: 'Пополнение карты компании',
    link: 'transfer-to-corporate-card',
    img: './assets/new-icons/corp-card.svg',
    titleTranslateKey:'createPayment.to_corporate_card',
    textTranslateKey:'createPayment.top_up_company_card',
    mode: "CORP_CARD_TOP_UP",
  },
  {
    title: 'В бюджет',
    text: 'Оплата налогов и взносов',
    link: 'transfer-to-budget',
    img: './assets/new-icons/bank-02.svg',
    titleTranslateKey:'createPayment.to_budget',
    textTranslateKey:'createPayment.pay_taxes_and_fees',
    mode: "BUDGET",
  },
  {
    title: 'В казначейство',
    text: 'Оплата в госорганы',
    link: 'transfer-to-treasure',
    img: './assets/new-icons/bank-03.svg',
    titleTranslateKey:'createPayment.to_treasury',
    textTranslateKey:'createPayment.pay_to_state_agencies',
    mode: "BUDGET",
  },
  {
    title: 'Государственные услуги',
    text: 'Оплата услуг',
    link: 'transfer-to-munis',
    img: './assets/new-icons/munis.svg',
    titleTranslateKey:'createPayment.munis',
    textTranslateKey:'new.service_payment',
    mode: "MUNIS",
  }
];

export const KARTOTEKA_ACTIONS: { title: string; link: string; text: string; img: string ,titleTranslateKey:string,textTranslateKey:string}[] = [
  {
    title: 'На счёт',
    text: 'В любой банк Узбекистана',
    link: 'transfer-to-account',
    img: './assets/new-icons/Shape.svg',
    titleTranslateKey:'createPayment.to_account',
    textTranslateKey:'createPayment.to_any_bank_uzbekistan'
  },
  {
    title: 'На карту',
    text: 'В любой банк Узбекистана',
    link: 'transfer-to-card',
    img: './assets/new-icons/credit-card-02.svg',
    titleTranslateKey:'createPayment.to_card',
    textTranslateKey:'createPayment.transfer_to_any_bank_card'
  },
  {
    title: 'В бюджет',
    text: 'По реквизитам',
    link: 'transfer-to-budget',
    img: './assets/new-icons/bank-02.svg',
    titleTranslateKey:'createPayment.to_budget',
    textTranslateKey:'createPayment.pay_taxes_and_fees',
  },
  {
    title: 'В казначейство',
    text: 'По реквизитам',
    link: 'transfer-to-treasure',
    img: './assets/new-icons/bank-03.svg',
    titleTranslateKey:'createPayment.to_treasury',
    textTranslateKey:'createPayment.pay_to_state_agencies',
  },
  {
    title: 'На зарплатную ведомость',
    text: 'Зарплатная ведомость',
    link: 'payroll-project/statements',
    img: './assets/new-icons/zp.svg',
    titleTranslateKey:'myAccounts.payroll_statement',
    textTranslateKey:'new.service_payment'
  }
  // {
  //   title: 'На зарплатную ведомость',
  //   text: 'Оплата услун',
  //   link: 'transfer-to-munis',
  //   img: './assets/new-icons/munis.svg',
  //   titleTranslateKey:'createPayment.munis',
  //   textTranslateKey:'new.service_payment'
  // }
];

export const KARTOTEKA_RESERVE_ACTIONS: { title: string; link: string; text: string; img: string ,titleTranslateKey:string,textTranslateKey:string}[] = [
  {
    title: 'На счёт',
    text: 'В любой банк Узбекистана',
    link: 'transfer-to-account',
    img: './assets/new-icons/Shape.svg',
    titleTranslateKey:'createPayment.to_account',
    textTranslateKey:'createPayment.to_any_bank_uzbekistan'
  },
  {
    title: 'На карту',
    text: 'В любой банк Узбекистана',
    link: 'transfer-to-card',
    img: './assets/new-icons/credit-card-02.svg',
    titleTranslateKey:'createPayment.to_card',
    textTranslateKey:'createPayment.transfer_to_any_bank_card'
  },
  {
    title: 'На корпоративную карту',
    text: 'Пополнение корпоративной карты',
    link: 'transfer-to-corporate-card',
    img: './assets/new-icons/corp-card.svg',
    titleTranslateKey:'createPayment.to_corporate_card',
    textTranslateKey:'createPayment.top_up_company_card',
  },
  {
    title: 'В бюджет',
    text: 'По реквизитам',
    link: 'transfer-to-budget',
    img: './assets/new-icons/bank-02.svg',
    titleTranslateKey:'createPayment.to_budget',
    textTranslateKey:'createPayment.pay_taxes_and_fees',
  },
  {
    title: 'В казначейство',
    text: 'По реквизитам',
    link: 'transfer-to-treasure',
    img: './assets/new-icons/bank-03.svg',
    titleTranslateKey:'createPayment.to_treasury',
    textTranslateKey:'createPayment.pay_to_state_agencies',
  },
];

