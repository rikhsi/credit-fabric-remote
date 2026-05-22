import { Pipe, PipeTransform } from '@angular/core';
import { translate } from '@jsverse/transloco';
import { PLURALIZE_FORMS_BY_TYPE } from '@app/constants/prefix';
import { pluralize } from '@shared/utils';
import { PluralizeType } from '@app/typings/pluralize';

@Pipe({
  name: 'pluralize',
})
export class PluralizePipe implements PipeTransform {
  transform(value: number, type: PluralizeType, withValue: boolean = true): string {
    const suffix = translate(pluralize(value, PLURALIZE_FORMS_BY_TYPE[type]));

    return withValue ? `${value} ${suffix}` : suffix;
  }
}
