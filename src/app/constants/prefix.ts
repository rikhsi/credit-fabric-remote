import { PluralizeType } from '@app/typings/pluralize';

export const AGE_PREFIXES: [string, string, string] = ['prefix.age.one', 'prefix.age.second', 'prefix.age.third'];
export const YEAR_PREFIXES: [string, string, string] = ['prefix.year.one', 'prefix.year.second', 'prefix.year.third'];
export const MONTH_PREFIXES: [string, string, string] = ['prefix.month.one', 'prefix.month.second', 'prefix.month.third'];
export const MONTH_PREFIXES_SHORT: [string, string, string] = [
  'prefix.month_short.one',
  'prefix.month_short.second',
  'prefix.month_short.third',
];
export const DAY_PREFIXES: [string, string, string] = ['prefix.day.one', 'prefix.day.second', 'prefix.day.third'];
export const USER_PREFIXES: [string, string, string] = ['prefix.user.one', 'prefix.user.second', 'prefix.user.third'];
export const SCHOOL_PREFIXES: [string, string, string] = ['prefix.school.one', 'prefix.school.second', 'prefix.school.third'];
export const REGION_PREFIXES: [string, string, string] = ['prefix.region.one', 'prefix.region.second', 'prefix.region.third'];
export const DISTRICT_PREFIXES: [string, string, string] = ['prefix.district.one', 'prefix.district.second', 'prefix.district.third'];
export const SUBJECT_PREFIXES: [string, string, string] = ['prefix.subject.one', 'prefix.subject.second', 'prefix.subject.third'];
export const MONEY_PREFIXES: [string, string, string] = ['prefix.money.one', 'prefix.money.second', 'prefix.money.third'];
export const BALL_PREFIXES: [string, string, string] = ['prefix.ball.one', 'prefix.ball.second', 'prefix.ball.third'];

/** Склоняемые формы по типу сущности (для pluralize / подписей). */
export const PLURALIZE_FORMS_BY_TYPE: Record<PluralizeType, [string, string, string]> = {
  age: AGE_PREFIXES,
  year: YEAR_PREFIXES,
  month: MONTH_PREFIXES,
  month_short: MONTH_PREFIXES_SHORT,
  user: USER_PREFIXES,
  school: SCHOOL_PREFIXES,
  district: DISTRICT_PREFIXES,
  region: REGION_PREFIXES,
  subject: SUBJECT_PREFIXES,
  money: MONEY_PREFIXES,
  ball: BALL_PREFIXES,
  day: DAY_PREFIXES,
};

export const SCALE_PREFIXES_BY_VALUE = {
  none: 'prefix.scale.none',
  thousand: 'prefix.scale.thousand',
  million: 'prefix.scale.million',
  billion: 'prefix.scale.billion',
} as const;
