import { Pipe, PipeTransform } from '@angular/core';
import { HandbookItem } from '@app/typings/handbook';

@Pipe({
  name: 'handbook',
})
export class HandbookPipe implements PipeTransform {
  transform(items: HandbookItem[] | null | undefined, id: number | string | null | undefined): string {
    if (id == null) {
      return '';
    }

    return items?.find((entry) => entry.id === id || String(entry.id) === String(id))?.name ?? String(id);
  }
}
