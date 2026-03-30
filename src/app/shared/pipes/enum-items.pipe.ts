import { inject, Pipe, PipeTransform } from '@angular/core';
import { ENUM_ITEMS_TOKEN } from '@constants';
import { EnumItem, EnumItemsResult, SelectItem } from '@typings';

@Pipe({
  name: 'enumItems',
})
export class EnumItemsPipe implements PipeTransform {
  enumItems: EnumItemsResult = inject(ENUM_ITEMS_TOKEN);

  transform<T>(_: T[], enumName: EnumItem): SelectItem<string>[] {
    return this.enumItems[enumName].map((item) => ({ ...item, key: item.key }));
  }
}
