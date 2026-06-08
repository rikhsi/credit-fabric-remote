import { MenuList } from "./models/menu-list.model";

export  const MAIN_MENU_LIST: MenuList[] = [
    {
      title: 'Главная',
      icon: 'home',
      link: 'main',
      titleKey:'main.home',
      permissions: ['ACCOUNT', 'PAYMENT'],
    },
    {
      title: 'Платежи',
      icon: 'wallet',
      link: 'payment',
      titleKey:'main.payments',
      permissions: ['ACCOUNT', 'PAYMENT'],
    },
    {
      title: 'Шаблоны',
      icon: 'star',
      link: 'templates',
      titleKey:'createPayment.templates',
      permissions: ['ACCOUNT', 'PAYMENT'],
    },
    {
      title: 'Счета',
      icon: 'receipt',
      link: 'accounts-and-payments',
      titleKey:'main.accounts',
      permissions: ['ACCOUNT', 'PAYMENT'],
    },
    {
      title: 'Корпоративные карты',
      icon: 'credit-card',
      link: 'corp-card-project',
      titleKey:'myAccounts.corporate_cards',
      permissions: ['CORPCARD'],
    },
    {
      title: 'Депозиты',
      icon: 'safe',
      link: 'deposits',
      permissions: ['DEPOSIT'],
      titleKey:'main.deposits'
    },
    {
      title: 'Кредиты',
      icon: 'wallet',
      link: 'loans',
      permissions: ['CREDIT'],
      titleKey:'main.loans'
    },
    {
      title: 'Выписки и отчёты',
      icon: 'file',
      link: 'charts',
      permissions: ['ACCOUNTHISTORY'],
      titleKey:'Выписки и отчёты'
    },
    {
      title: 'Картотека',
      icon: 'bar-chart-square',
      link: 'kartoteka',
      permissions: ['CARDFILE'],
      titleKey:'main.card_index'

    },
    // {
    //   title: 'ЭПТ',
    //   icon: 'bank',
    //   link: 'bank',
    //   permissions: ['BANK_MAIL'],
    // },
    {
      title: 'Мои заявки',
      icon: 'file',
      link: 'applications',
      permissions: ['APPLICATION'],
      titleKey:'Мои заявки'
    },
    {
      title: 'Зарплатный проект',
      icon: 'wallet',
      link: 'payroll-project',
      permissions: ['PAYROLL_PROJECT'],
      titleKey:'main.payroll_project'
    },


    // {
    //   title: 'Аккредитивы',
    //   icon: 'wallet-add',
    //   link: 'letters-of-credit',
    //   permissions: ['ACCREDIT'],
    //   titleKey:"Аккредитивы"
    // },
    // {
    //   title: 'Гарантии',
    //   icon: 'shield',
    //   link: 'guarantees',
    //   titleKey:'Гарантии'
    // },
    // {
    //   title: 'Безопасность',
    //   icon: 'lock',
    //   link: '/security',
    //   titleKey:'settings.security'
    // },
    // {
    //   title: 'Вопросы и ответы',
    //   icon: 'faq-chat',
    //   link: '/chat/faq',
    //   titleKey:'Вопросы и ответы'
    // },
    // {
    //   title: 'Переписка с оператором',
    //   icon: 'faq-conversation',
    //   link: '/chat/conversation',
    //   titleKey:'Переписка с оператором'
    // },
  ];

 export const PROFILE_MENU_LIST: MenuList[] = [
    {
      title: 'Профиль',
      icon: 'user',
      link: '/profile/me',
      titleKey:'main.profile'
    },
  ];

export const NOTIFICATIOIN_MENU_LIST: MenuList[] = [
    {
      title: 'Уведомления',
      icon: 'notification',
      link: '/notification/list',
      titleKey:'main.notifications'
    },
  ]

  export const SETTINGS_MENU_LIST: MenuList[] = [
    {
      title: 'Пассивные пользователи',
      icon: 'user-add',
      link: '/settings/passive-users',
      titleKey:'Пассивные пользователи'
    },
    {
      title: 'Прикрепить счета',
      icon: 'user-tag',
      link: '/settings/attach-account',
      titleKey:'Прикрепить счета'
    },
    {
      title: 'Структура подписа',
      icon: 'arrange-square-2',
      link: '/settings/sign-order',
      titleKey:'Структура подписа'
    },
  ];
