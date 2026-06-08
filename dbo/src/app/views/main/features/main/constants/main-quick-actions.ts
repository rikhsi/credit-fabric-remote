import { QuickAction } from '../../../../../shared/interfaces/quick-action.interface';

export const mainQuickActions: QuickAction[] = [
  {
    title: 'Платеж контрагенту',
    src: 'file-plus.svg',
    link: '/pay',
    visible: true,
  },
  {
    title: 'Платёж в бюджет',
    src: 'file-plus-yellow.svg',
    link: '/pay/BUDGET',
    visible: true,
  },
  {
    title: 'Платёж в бюджет доход',
    src: 'file-plus-green.svg',
    link: '/pay/BUDGET_INCOME',
    visible: true,
  },
  {
    title: 'Создать валютный перевод',
    src: 'globe.svg',
    link: '/create-swift',
    visible: true,
  },
  {
    title: 'Сформировать выписку',
    src: 'trending-up.svg',
    link: '/accounts-and-payments',
    visible: true,
  },
]
