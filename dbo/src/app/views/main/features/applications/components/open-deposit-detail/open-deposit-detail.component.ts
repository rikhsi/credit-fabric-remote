import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { AmountService } from '../../../../../../core/services/amount.service';

@Component({
    selector: 'app-open-deposit-detail',
    imports: [
        NgIf
    ],
    templateUrl: './open-deposit-detail.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpenDepositDetailComponent {
  @Input() detail!: any;

  constructor(
    public amountService: AmountService,
  ) {
  }
}
