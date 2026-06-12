import { Pipe, PipeTransform } from '@angular/core';
import { HandbookItem } from '@app/typings/handbook';
import { SelectOption } from '@app/typings/select';

@Pipe({
  name: 'handbookSelectOptions',
})
export class HandbookSelectOptionsPipe implements PipeTransform {
  transform(items: HandbookItem[] | null | undefined): SelectOption[] {
    return (items ?? []).map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }
}
