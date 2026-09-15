import { Pipe, PipeTransform } from '@angular/core';
import { ProductConditionItem } from '@api/models/los/product';
import { mergeProductConditions } from '@api/utils';

@Pipe({
  name: 'conditionTerm',
})
export class ConditionTermPipe implements PipeTransform {
  transform(value: ProductConditionItem[]): number {
    return mergeProductConditions(value)?.maxTerm ?? 0;
  }
}
