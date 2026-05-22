import { inject, Pipe, PipeTransform } from '@angular/core';
import { translate } from '@jsverse/transloco';
import { ENUM_ITEMS_TOKEN } from '@app/constants/enum-items';
import { EnumItemsResult, EnumItem } from '@app/typings/enums';
import { SelectItem } from '@app/typings/item';

@Pipe({
  name: 'enumItem',
})
export class EnumItemPipe implements PipeTransform {
  enumItems: EnumItemsResult = inject(ENUM_ITEMS_TOKEN);

  transform(value: number, type: EnumItem): string | undefined {
    return translate(this.enumItems[type]?.find((item: SelectItem<number | string>) => item.value === value)?.key);
  }
}
