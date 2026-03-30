import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'cf-product-info',
  imports: [],
  templateUrl: './product-info.html',
  styleUrl: './product-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInfo {}
