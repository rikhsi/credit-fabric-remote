import { QuickAction } from '../../../../../shared/interfaces/quick-action.interface';

export const operationsQuickActions: QuickAction[] = [
  {
    title: 'Заявление на банковский перевод в иностранной валюте',
    src: 'foreign-exchange-transactions.svg',
    link: '/currency-transactions',
    visible: true,
  },
  {
    title: 'Заявка на покупку иностранной валюты',
    src: 'buy-currency-application.svg',
    link: '/currency-buy',
    visible: true,
  },
  {
    title: 'Заявка на продажу иностранной валюты',
    src: 'sell-currency-application.svg',
    link: '/currency-sell',
    visible: true,
  },
  {
    title: 'Конверсия (СКВ на СКВ)',
    src: 'conversion-operations.svg',
    link: '/conversion-operations',
    visible: true,
  },
  // {
  //   title: 'Внешние займы ExDebtUz',
  //   src: 'ex-debt.svg',
  //   link: '',
  // },
  {
    title: 'Внешнеторговые контракты в ЕЭИСВО',
    src: 'eisvo-contracts.svg',
    link: '/eisvo',
    visible: true,
  },
]
