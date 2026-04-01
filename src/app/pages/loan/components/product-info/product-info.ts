import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Card, LabelControl } from '@shared/components';

@Component({
  selector: 'cf-product-info',
  imports: [LabelControl, Card],
  templateUrl: './product-info.html',
  styleUrl: './product-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInfo {}
