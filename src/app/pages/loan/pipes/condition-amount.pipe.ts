import { Pipe, PipeTransform } from '@angular/core';
import { ProductConditionItem } from '@api/models/los/product';
import { mergeProductConditions } from '@api/utils';

@Pipe({
  name: 'conditionAmount',
})
export class ConditionAmountPipe implements PipeTransform {
  transform(value: ProductConditionItem[]): number {
    return mergeProductConditions(value)?.maxAmount ?? 0;
  }
}
