import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AmountService } from '../../../../../../core/services/amount.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-app-accredit-detail',
    imports: [
        NgIf
    ],
    templateUrl: './app-accredit-detail.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppAccreditDetailComponent {
  @Input() detail!: any;

  constructor(
    public amountService: AmountService,
  ) {
  }
}
