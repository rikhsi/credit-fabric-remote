import { Pipe, PipeTransform } from '@angular/core';
import { translate } from '@jsverse/transloco';
import {
  AGE_PREFIXES,
  BALL_PREFIXES,
  DISTRICT_PREFIXES,
  MONEY_PREFIXES,
  MONTH_PREFIXES,
  REGION_PREFIXES,
  SCHOOL_PREFIXES,
  SUBJECT_PREFIXES,
  USER_PREFIXES,
  YEAR_PREFIXES,
  DAY_PREFIXES,
} from '@constants';
import { pluralize } from '@shared/utils';
import { PluralizeType } from '@typings';

@Pipe({
  name: 'pluralize',
})
export class PluralizePipe implements PipeTransform {
  transform(value: number, type: PluralizeType, withValue: boolean = true): string {
    const prefixMap = {
      month: MONTH_PREFIXES,
      year: YEAR_PREFIXES,
      age: AGE_PREFIXES,
      user: USER_PREFIXES,
      school: SCHOOL_PREFIXES,
      region: REGION_PREFIXES,
      district: DISTRICT_PREFIXES,
      subject: SUBJECT_PREFIXES,
      money: MONEY_PREFIXES,
      ball: BALL_PREFIXES,
      day: DAY_PREFIXES,
    };

    const suffix = translate(pluralize(value, prefixMap[type] ?? AGE_PREFIXES));

    return withValue ? `${value} ${suffix}` : suffix;
  }
}
