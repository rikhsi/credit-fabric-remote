// import {MainPaymentTabKey} from "../../new-main/constants/new-main.const";

export const timesList = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0');
  const minutes = index % 2 === 0 ? '00' : '30';
  return { hour, minutes };
});


export  const  TEMPLATES_TABS : { key: TemplatesTabKey; name: string; translateKey: string; }[] = [
  // { key: 'all', name: 'Все', translateKey: 'templates.all' },
  { key: 'sum', name: 'Сумовые', translateKey: 'templates.local_currency' },
  { key: 'exchange', name: 'Валютные', translateKey: 'templates.foreign_currency' },
];

export type TemplatesTabKey = 'all' | 'sum' | 'exchange';
