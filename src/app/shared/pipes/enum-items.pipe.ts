import { inject, Pipe, PipeTransform } from '@angular/core';
import { ENUM_ITEMS_TOKEN } from '@app/constants/enum-items';
import { EnumItemsResult, EnumItem } from '@app/typings/enums';
import { SelectItem } from '@app/typings/item';

@Pipe({
  name: 'enumItems',
})
export class EnumItemsPipe implements PipeTransform {
  enumItems: EnumItemsResult = inject(ENUM_ITEMS_TOKEN);

  transform<T>(_: T[], enumName: EnumItem): SelectItem<string>[] {
    return this.enumItems[enumName].map((item) => ({ ...item, key: item.key }));
  }
}
