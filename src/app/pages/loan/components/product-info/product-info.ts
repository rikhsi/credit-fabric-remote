import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { Card, LabelControl } from '@shared/components';
import { PluralizePipe } from '@shared/pipes';

@Component({
  selector: 'cf-product-info',
  imports: [LabelControl, Card, TranslocoDirective, DecimalPipe, PluralizePipe, NzSkeletonModule],
  templateUrl: './product-info.html',
  styleUrl: './product-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInfo {
  annualRate = input<number>(18);
  loanAmount = input<number>(30);
  loanTerm = input<number>(3);
  isGuarant = input<boolean>();

  isLoading = input<boolean>();
}
