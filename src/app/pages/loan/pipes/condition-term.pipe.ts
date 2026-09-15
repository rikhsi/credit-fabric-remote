import { Pipe, PipeTransform } from '@angular/core';
import { ProductConditionItem } from '@api/models/los/product';

@Pipe({
  name: 'conditionTerm',
})
export class ConditionTermPipe implements PipeTransform {
  transform(value: ProductConditionItem[]): number {
    return null;
  }
}
