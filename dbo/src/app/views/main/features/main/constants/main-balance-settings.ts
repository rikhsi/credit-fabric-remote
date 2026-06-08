import { QuickAction } from '../../../../../shared/interfaces/quick-action.interface';

export const mainBalanceSettings: QuickAction[] = [
  { title: 'Расчетные счета', enum: 'SETTLEMENT', visible: true, codes: ["20203", "20204", "20208", "20210", "20212", "20214", "20216", "20218", "20296"] },
  { title: 'Транзитные счета', enum: "TRANSIT", visible: true, codes: ["20203", "20204", "20208", "20210", "20212", "20214", "20216", "20218", "20296"] },
  { title: 'Специальные счета для конвертации', enum: "SPECIAL_FOR_CONVERSION", visible: true, codes: ["22613", "22614"] },
  { title: 'Специальные счета по корп картам', enum: "SPECIAL_FOR_CORP_CARD", visible: true, codes: ["22619", "22620"] },
  { title: 'Грантовые счета', visible: false, enum: "GUARANTEE", codes: ["22696"] },
  { title: 'Счет комиссий', visible: false, enum: "COMMISSION", codes: ["16401"] },
  { title: 'Ссудные счета', visible: false, enum: "LOAN", codes: ["125", "157", "163"] },
  { title: 'Аккредитивные счета', visible: false, enum: "LETTER_OF_CREDIT", codes: ["22602"] },
  { title: 'Срочные депозиты', visible: false, enum: "TERM_DEPOSIT", codes: ["22622"] },
  { title: 'Сберегательные депозиты', visible: false, enum: "SAVINGS_DEPOSIT", codes: ["20603", "20604", "20608", "20610", "20612", "20614", "20616", "20618", "20696"] },
  { title: 'Счета процентов по депозитам', visible: false, enum: "INTEREST_FOR_DEPOSITS", codes: ["20403", "20404", "20408", "20410", "20412", "20414", "20416", "20418", "20496"] },
  { title: 'Прочие счета', visible: false, enum: "MISCELLANEOUS", codes: ["29801", "29896"] },
];
