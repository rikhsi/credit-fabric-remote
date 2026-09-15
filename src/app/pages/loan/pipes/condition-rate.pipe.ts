import { Pipe, PipeTransform } from '@angular/core';
import { ProductConditionItem } from '@api/models/los/product';
import { mergeProductConditions } from '@api/utils';

@Pipe({
  name: 'conditionRate',
})
export class ConditionRatePipe implements PipeTransform {
  transform(value: ProductConditionItem[]): number {
    return mergeProductConditions(value)?.interestRate ?? 0;
  }
}
