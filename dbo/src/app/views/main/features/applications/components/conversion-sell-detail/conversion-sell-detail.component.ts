import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AmountService } from '../../../../../../core/services/amount.service';
import { DatePipe, NgIf } from '@angular/common';

@Component({
    selector: 'app-conversion-sell-detail',
    imports: [
        DatePipe,
        NgIf,
    ],
    templateUrl: './conversion-sell-detail.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversionSellDetailComponent {
  @Input() detail!: any;

  constructor(
    public amountService: AmountService,
  ) {
  }
}
