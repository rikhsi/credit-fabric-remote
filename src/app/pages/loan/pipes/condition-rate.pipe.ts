import { Pipe, PipeTransform } from '@angular/core';
import { ProductConditionItem } from '@api/models/los/product';

@Pipe({
  name: 'conditionRate',
})
export class ConditionRatePipe implements PipeTransform {
  transform(value: ProductConditionItem[]): number {
    return null;
  }
}
