import { Pipe, PipeTransform } from '@angular/core';
import { ProductConditionItem } from '@api/models/los/product';

@Pipe({
  name: 'conditionAmount',
})
export class ConditionAmountPipe implements PipeTransform {
  transform(value: ProductConditionItem[]): number {
    return null;
  }
}
