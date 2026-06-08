import {DatePipe} from "@angular/common";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TabKey} from "../../views/main/features/new-main/constants/new-main.const";
import {inject} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

export const getStatusApplication =(status: string | undefined, type = 'DEFAULT'): { label: string, color: string, text?: string } => {
  if(type === 'CARD') {
    return switchStatusCard(status);
  } else {
    return switchStatusApplication(status);
  }
}

export const docType = {
  '01': 'Платёжное поручение',
  '02': 'Платёжное требование',
  '03': 'Кссовые документы',
  '04': 'Лимитированные чеки',
  '05': 'Заявление на аккредитив',
  '06': 'Мемориальный ордер',
  '08': 'Исправительный мемориальный ор',
  '09': 'Электронная кредитная карточка',
  '11': 'Инкассовое поручение',
  '12': 'Платёжное требование поручение',
  '14': 'Расчетные чеки коммерческих ба',
  '21': 'Пл.поруч.через.сист.дист.обсл.',
  '22': 'Электронн. платёжное требование',
}

function switchStatusCard(status: string | undefined) {
  switch (status) {
    case 'NEW':
      return { label: 'Создан', color: 'bg-blue-500', text: 'text-white' };
    case 'CREATED':
      return { label: 'Отправлен в банк', color: 'bg-[#DBF6CB]', text: 'text-[#1C7C4C] text-nowrap' };
    case 'SENT_TO_EMPLOYEE':
      return { label: 'Отправлен сотруднику', color: 'bg-[#DBF6CB]', text: 'text-[#1C7C4C] text-nowrap' };
    case 'CANCELED':
      return { label: 'Отменен', color: 'bg-[#f3f3f3]', text: 'text-[#909090]' };
    case 'READY':
      return { label: 'Готово к выдаче', color: 'bg-[#DBF6CB]', text: 'text-[#1C7C4C] text-nowrap' };
    case 'SUCCESS':
      return { label: 'Карта получена', color: 'bg-[#DBF6CB]', text: 'text-[#1C7C4C] text-nowrap' };
    case 'REQUEST_ACCEPTED':
      return { label: 'Подтверждён пользователем', color: 'bg-[#dbf6cb]', text: 'text-[#1c7c4c] text-no-wrap' };
    default:
      return { label: `Отправлен в банк`, color: 'bg-gray-400', text: 'text-white text-nowrap' };
  }
}

function switchStatusApplication(status: string | undefined) {
  switch (status) {
    case 'REQUEST_ACCEPTED':
      return { label: 'Принят', color: '', text: 'text-[#1c7c4c] text-no-wrap' };
    case 'DRAFT':
      return { label: 'Черновик', color: '', text: 'text-white text-no-wrap' };
    case 'NEW':
      return { label: 'Создан', color: '', text: 'text-white' };
    case 'ACTIVE':
      return { label: 'Активен', color: 'bg-[#27AE60]', text: 'text-[#27AE60]' };
    case 'APPROVE':
      return { label: 'Активный', color: '', text: 'text-[#002889]' };
    case 'ENTER':
      return { label: 'В процессе', color: 'bg-[#002889]', text: 'text-[#002889]' };
    case 'SIGN':
      return { label: 'Подписание', color: '', text: 'text-[#c57718]' };
    case 'IN_PROGRESS':
      return { label: 'В процессе', color: '', text: 'text-[#002889]' };
    case 'REJECTED':
      return { label: 'Отклонено', color: '', text: 'text-[#a21e16]' };
    case 'CANCELED':
      return { label: 'Отменено', color: '', text: 'text-[#909090]' };
    case 'Ошибки':
      return { label: 'Ошибка', color: '', text: 'text-[#A21E16]' };
    case 'ERROR':
      return { label: 'Ошибка', color: '', text: 'text-[#A21E16]' };
    case 'Отправлен в Банк':
      return { label: 'Отправлен в Банк', color: '', text: 'text-[#1c7c4c] text-nowrap' };
    case 'COMPLETED':
      return { label: 'Отправлен в Банк', color: '', text: 'text-[#1c7c4c] text-nowrap' };
    case 'PREPARE':
      return { label: 'Создан', color: '', text: 'text-[#002889]'};
    case 'SAVED':
      return { label: 'Сохранён', color: '', text: 'text-[#002889]'};
    case 'SUCCESS':
      return { label: 'Отправлен в Банк', color: '', text: 'text-[#1C7C4C] text-nowrap' };
    case 'Принят КЦ':
      return { label: 'Принят КЦ', color: '', text: 'text-[#1C7C4C] text-nowrap' };
    case 'Запланирован':
      return { label: 'Запланирован', color: '', text: 'text-[#002889]' };
    case 'Введен':
      return { label: 'Введен', color: '', text: 'text-[#002889]' };
    case 'Удален':
      return { label: 'Удален', color: '', text: 'text-[#A21E16]' };
    case 'На удаление':
      return { label: 'На удаление', color: '', text: 'text-[#A21E16] text-nowrap' };
    case 'На доработку':
      return { label: 'На доработку', color: '', text: 'text-[#C57718] text-nowrap' };
    case 'Ожидает утверждения':
      return { label: 'Ожидает утверждения', color: '', text: 'text-[#C57718] text-nowrap' };
    case 'На верификации':
      return { label: 'На верификации', color: '', text: 'text-[#C57718] text-nowrap' };
    case 'Забракован':
      return { label: 'Забракован', color: '', text: 'text-[#A21E16]' };
    case 'Отклонен ГО':
      return { label: 'Отклонен ГО', color: '', text: 'text-[#A21E16]' };
    case 'Отклонен':
      return { label: 'Отклонен', color: '', text: 'text-[#A21E16]' };
    case 'Аннулирован ГО':
      return { label: 'Аннулирован ГО', color: '', text: 'text-[#A21E16]' };
    case 'Отложен':
      return { label: 'Отложен', color: '', text: 'text-[#C57718]' };
    case 'Закрыто':
      return { label: 'Закрыто', color: '', text: 'text-white text-nowrap' };
    case 'Утвержден':
      return { label: 'Утвержден', color: '', text: 'text-[#002889]' };
    case 'Отправлен в ГО':
      return { label: 'Отправлен в ГО', color: '', text: 'text-[#002889]' };
    case 'Отправлен в ДВО ГО':
      return { label: 'Отправлен в ДВО ГО', color: '', text: 'text-[#002889]' };
    case 'Принял ГО':
      return { label: 'Принял ГО', color: '', text: 'text-[#002889]' };
    case 'Утвержден ГО':
      return { label: 'Утвержден ГО', color: '', text: 'text-[#002889]' };
    case 'Утвержден ГЛБ':
      return { label: 'Утвержден ГЛБ', color: '', text: 'text-[#002889] text-nowrap' };
    case 'Отправлен в КЦ':
      return { label: 'Отправлен в КЦ', color: '', text: 'text-[#1C7C4C] text-nowrap' };
    case 'Отправлен на верификацию':
      return { label: 'Отправлен на верификацию', color: '', text: 'text-[#C57718] text-nowrap' };
    case 'Принят к верификации':
      return { label: 'Принят к верификации', color: '', text: 'text-[#1C7C4C] text-nowrap' };
    case 'Проведен':
      return { label: 'Проведен', color: '', text: 'text-[#1C7C4C] text-nowrap' };
    case 'READY':
      return { label: 'Готово', color: '', text: 'text-[#1C7C4C] text-nowrap' };
    case 'Активный':
      return { label: 'Активный', color: '', text: 'text-[#1C7C4C] text-nowrap' };
    case 'A':
      return { label: 'Активный', color: '', text: 'text-[#1C7C4C] text-nowrap' };
    case 'SENT_TO_EMPLOYEE':
      return { label: 'Отправлен работадателю', color: '', text: 'text-[#1C7C4C] text-nowrap' };
    case 'AUTO_PAY':
      return { label: `Автоплатёж`, color: 'bg-gray-400', text: 'text-white text-nowrap' };
    case 'CLOSED':
      return { label: `Закрыт`, color: '', text: 'text-white text-nowrap' };
    case 'INACTIVE':
      return { label: `Закрыт`, color: '', text: 'text-white text-nowrap' };
    case 'REVERTED':
      return { label: `На доработке`, color: '', text: 'text-white text-nowrap' };
    case 'Активна':
      return { label: `Активна`,  color: 'bg-[#27AE60]', text: 'text-[#27AE60]' };
    case 'Блокирована':
      return { label: `Блокирована`, color: 'bg-[#9CA4AD]', text: 'text-[#9CA4AD]' };
    case 'Истек срок':
      return { label: `Истек срок`, color: 'bg-[#FF0000]', text: 'text-[#FF0000]' };
    default:
      return { label: `В обработке`, color: '', text: 'text-white text-nowrap' };
  }
}

export const getStatusApp =(status: string | undefined): { label: string, color: string, text?: string } => {
  switch (status) {
    case 'REQUEST_ACCEPTED':
      return { label: 'Принят', color: 'bg-[#dbf6cb]', text: 'text-[#1c7c4c] text-no-wrap' };
    case 'DRAFT':
      return { label: 'Черновик', color: 'bg-gray-500', text: 'text-white text-no-wrap' };
    case 'NEW':
      return { label: 'Создан', color: 'bg-blue-500', text: 'text-white' };
    case 'ACTIVE':
      return { label: 'Активный', color: 'bg-[#CCE4FF]', text: 'text-[#002889]' };
    case 'SIGN':
      return { label: 'Подписание', color: 'bg-[#fff2dd]', text: 'text-[#c57718]' };
    case 'IN_PROGRESS':
      return { label: 'В процессе', color: 'bg-[#cce4ff]', text: 'text-[#002889]' };
    case 'REJECTED':
      return { label: 'Отклонено', color: 'bg-[#ffdcda]', text: 'text-[#a21e16]' };
    case 'CANCELED':
      return { label: 'Отменен', color: 'bg-[#f3f3f3]', text: 'text-[#909090]' };
    case 'Ошибки':
      return { label: 'Ошибка', color: 'bg-[#FFDCDA]', text: 'text-[#A21E16]' };
    case 'ERROR':
      return { label: 'Ошибка', color: 'bg-[#FFDCDA]', text: 'text-[#A21E16]' };
    case 'COMPLETED':
      return { label: 'Завершён', color: 'bg-[#dbf6cb]', text: 'text-[#1c7c4c] text-nowrap' };
    case 'PREPARE':
      return { label: 'Создан', color: 'bg-[#CCE4FF]', text: 'text-[#002889]'};
    case 'SAVED':
      return { label: 'Сохранён', color: 'bg-[#CCE4FF]', text: 'text-[#002889]'};
    case 'SUCCESS':
      return { label: 'Отправлен в Банк', color: 'bg-[#DBF6CB]', text: 'text-[#1C7C4C] text-nowrap' };
    case 'Принят КЦ':
      return { label: 'Принят КЦ', color: 'bg-[#DBF6CB]', text: 'text-[#1C7C4C] text-nowrap' };
    case 'Запланирован':
      return { label: 'Запланирован', color: 'bg-[#CCE4FF]', text: 'text-[#002889]' };
    case 'Введен':
      return { label: 'Введен', color: 'bg-[#CCE4FF]', text: 'text-[#002889]' };
    case 'Удален':
      return { label: 'Удален', color: 'bg-[#FFDCDA]', text: 'text-[#A21E16]' };
    case 'На удаление':
      return { label: 'На удаление', color: 'bg-[#FFDCDA]', text: 'text-[#A21E16] text-nowrap' };
    case 'На доработку':
      return { label: 'На доработку', color: 'bg-[#FFF2DD]', text: 'text-[#C57718] text-nowrap' };
    case 'Ожидает утверждения':
      return { label: 'Ожидает утверждения', color: 'bg-[#FFF2DD]', text: 'text-[#C57718] text-nowrap' };
    case 'На верификации':
      return { label: 'На верификации', color: 'bg-[#FFF2DD]', text: 'text-[#C57718] text-nowrap' };
    case 'Забракован':
      return { label: 'Забракован', color: 'bg-[#FFDCDA]', text: 'text-[#A21E16]' };
    case 'Отклонен ГО':
      return { label: 'Отклонен ГО', color: 'bg-[#FFDCDA]', text: 'text-[#A21E16]' };
    case 'Отклонен':
      return { label: 'Отклонен', color: 'bg-[#FFDCDA]', text: 'text-[#A21E16]' };
    case 'Аннулирован ГО':
      return { label: 'Аннулирован ГО', color: 'bg-[#FFDCDA]', text: 'text-[#A21E16]' };
    case 'Отложен':
      return { label: 'Отложен', color: 'bg-[#FFF2DD]', text: 'text-[#C57718]' };
    case 'Утвержден':
      return { label: 'Утвержден', color: 'bg-[#CCE4FF]', text: 'text-[#002889]' };
    case 'Отправлен в ГО':
      return { label: 'Отправлен в ГО', color: 'bg-[#CCE4FF]', text: 'text-[#002889]' };
    case 'Отправлен в ДВО ГО':
      return { label: 'Отправлен в ДВО ГО', color: 'bg-[#CCE4FF]', text: 'text-[#002889]' };
    case 'Принял ГО':
      return { label: 'Принял ГО', color: 'bg-[#CCE4FF]', text: 'text-[#002889]' };
    case 'Утвержден ГО':
      return { label: 'Утвержден ГО', color: 'bg-[#CCE4FF]', text: 'text-[#002889]' };
    case 'Утвержден ГЛБ':
      return { label: 'Утвержден ГЛБ', color: 'bg-[#CCE4FF]', text: 'text-[#002889] text-nowrap' };
    case 'Отправлен в КЦ':
      return { label: 'Отправлен в КЦ', color: 'bg-[#DBF6CB]', text: 'text-[#1C7C4C] text-nowrap' };
    case 'Отправлен на верификацию':
      return { label: 'Отправлен на верификацию', color: 'bg-[#FFF2DD]', text: 'text-[#C57718] text-nowrap' };
    case 'Принят к верификации':
      return { label: 'Принят к верификации', color: 'bg-[#DBF6CB]', text: 'text-[#1C7C4C] text-nowrap' };
    case 'Проведен':
      return { label: 'Проведен', color: 'bg-[#DBF6CB]', text: 'text-[#1C7C4C] text-nowrap' };
    case 'AUTO_PAY':
      return { label: `Автоплатёж`, color: 'bg-gray-400', text: 'text-white text-nowrap' };
    default:
      return { label: `${status}`, color: 'bg-gray-400', text: 'text-white text-nowrap' };
  }
}

export const getStatusTranslation = (status: string): { translation: string, bgColor: string } => {
  switch (status) {
    case 'SAVED':
      return {translation: 'Сохранено', bgColor: 'bg-blue-500'};
    case 'PREPARE':
      return {translation: 'Создано', bgColor: 'bg-yellow-500'};
    case 'PREPARE_DIRECTOR':
      return {translation: 'Готовится директором', bgColor: 'bg-yellow-600'};
    case 'PENDING':
      return {translation: 'Ожидание', bgColor: 'bg-orange-500'};
    case 'SUCCESS':
      return {translation: 'Успешно', bgColor: 'bg-green-500'};
    case 'CANCEL':
      return {translation: 'Отменено', bgColor: 'bg-red-500'};
    case 'SIGN':
      return {translation: 'Подписание', bgColor: 'bg-blue-300'};
    case 'ERROR':
      return {translation: 'Ошибка', bgColor: 'bg-red-700'};
    default:
      return {translation: 'Неизвестно', bgColor: 'bg-gray-500'};
  }
}

export const getRussianFormattedDate = (dateString: any): string => {
  if (!dateString) {
    return 'Invalid date';
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const months = [
    'Янв.', 'Фев.', 'Мар.', 'Апр.', 'Май.', 'Июн.', 'Июл.', 'Авг.', 'Сен.', 'Окт.', 'Ноя.', 'Дек.',
  ];

  // Provide the 'ru' locale for Russian formatting
  const datePipe = new DatePipe('ru');

  const dayOfWeek = daysOfWeek[date.getDay()];
  const day = datePipe.transform(date, 'dd');
  const month = months[date.getMonth()];
  const year = datePipe.transform(date, 'yyyy');
  const time = datePipe.transform(date, 'HH:mm');

  return `${dayOfWeek}, ${day} ${month} ${year} ${time}`;
}

export function getStepsApplication (steps: string): string  {
  switch (steps) {
    case 'CREATED':
      return 'Создается';
    case 'REJECTED':
      return 'Отклонено';
    case 'READY':
      return 'Готово';
    case 'DELIVERING':
      return 'Отправляется';
    case 'CANCELLED':
      return 'Отменено';
    case 'REQUEST_ACCEPTED':
      return 'Запрос принят';
    case 'STOP_FACTOR_SUCCESS':
      return 'Успешно стоп-фактор';
    case 'SCORING_SUCCESS':
      return 'Успешно скоринг';
    case 'REQUEST_CLIENT_DECISION':
      return 'Запрос клиентского решения';
    case 'LOAN_CONTRACT_SUCCESS':
      return 'Успешно кредитный договор';
    case 'ISSUED_SUCCESS':
      return 'Успешно выдан';
    case 'STOP_FACTOR_ERROR':
      return 'Не успешно (СТОП-ФАКТОР)';
    case 'PROCESS':
      return 'Процесс';
    case 'SCORING_ERROR':
      return 'Не успешно (СКОРИНГ)';
    case 'SYSTEM_ERROR':
      return 'Ошибка';
  }
  return steps
}
export function maskNumberMiddle(value: string | number | undefined, showStart = 5, showEnd = 3) {
  const s = String(value ?? '');
  if (!s) return '';
  if (s.length <= showStart + showEnd) return s;
  const start = s.slice(0, showStart);
  const end = s.slice(-showEnd);
  return `${start} * * ${end}`;
}
export function getTranslate(s: TabKey): string {
  const dict: Record<TabKey, string> = {
    accounts: 'счета',
    cards: 'карты',
    deposits: 'депозиты',
    credits: 'кредиты',
  };
  return dict[s] ?? s;
}
export function formatDateNew(dateString: string): string {
  const [day, month, year] = dateString.split('.').map(Number);

  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long'
  }).format(date);
}


export function formatDate(dateString: string, translate?: TranslateService): string {
  const [datePart] = dateString?.split(' ');
  const [_, month, day] = datePart?.split('-');

  const translateMonths = [
    'new.january',
    'new.february',
    'new.march',
    'new.april',
    'new.may',
    'new.june',
    'new.july',
    'new.august',
    'new.september',
    'new.october',
    'new.november',
    'new.december'
  ];
  const monthIndex = Number(month) - 1;
  const monthKey = translateMonths[monthIndex];
  const monthName = translate?.instant(monthKey);

  return `${Number(day)} ${monthName}`;
}

export function getGroupedTransactions(transactions: any, translateService?: TranslateService) {
  return transactions?.reduce((groups: any, transaction: any) => {
    const formattedDate = transaction.lastStatusTime ? formatDate(transaction.lastStatusTime, translateService) : '';
    if (!groups[formattedDate]) {
      groups[formattedDate] = [];
    }
    groups[formattedDate].push(transaction);
    return groups;
  }, {});
}

export function getGroupedCardTransactions(transactions: any[]) {
  if (!transactions || !Array.isArray(transactions)) return {};

  return transactions.reduce((groups: any, transaction: any) => {
    const formattedDate = transaction.date ? transaction.date : '';

    if (!groups[formattedDate]) {
      groups[formattedDate] = [];
    }

    groups[formattedDate].push(transaction);
    return groups;
  }, {});
}


