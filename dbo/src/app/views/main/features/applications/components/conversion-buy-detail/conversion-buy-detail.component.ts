import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { AmountService } from '../../../../../../core/services/amount.service';

@Component({
    selector: 'app-conversion-buy-detail',
    imports: [
        DatePipe,
        NgIf,
    ],
    templateUrl: './conversion-buy-detail.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversionBuyDetailComponent {
  @Input() detail!: any;

  constructor(
    public amountService: AmountService,
  ) {
  }
}
