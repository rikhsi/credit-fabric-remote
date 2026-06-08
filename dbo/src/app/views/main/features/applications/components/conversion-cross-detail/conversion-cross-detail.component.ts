import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AmountService } from '../../../../../../core/services/amount.service';
import { DatePipe, NgIf } from '@angular/common';

@Component({
    selector: 'app-conversion-cross-detail',
    imports: [
        DatePipe,
        NgIf,
    ],
    templateUrl: './conversion-cross-detail.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversionCrossDetailComponent {
  @Input() detail!: any;

  constructor(
    public amountService: AmountService,
  ) {
  }
}
