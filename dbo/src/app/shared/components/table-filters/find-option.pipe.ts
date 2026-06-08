import { Pipe, PipeTransform } from '@angular/core';
import { FilterOption } from "./table-filters.model";

@Pipe({ name: 'findOption' })
export class FindOptionPipe implements PipeTransform {
  transform(options: FilterOption[], value: string): FilterOption | undefined {
    return options.find((option) => option.value === value);
  }
}
