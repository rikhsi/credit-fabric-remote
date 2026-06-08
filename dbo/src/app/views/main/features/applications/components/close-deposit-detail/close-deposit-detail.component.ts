import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AmountService } from '../../../../../../core/services/amount.service';

@Component({
    selector: 'app-close-deposit-detail',
    imports: [],
    templateUrl: './close-deposit-detail.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloseDepositDetailComponent {
  @Input() detail!: any;

  constructor(
    public amountService: AmountService,
  ) {
  }
}
