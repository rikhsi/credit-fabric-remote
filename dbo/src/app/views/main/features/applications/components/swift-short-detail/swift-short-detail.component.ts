import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AmountService } from '../../../../../../core/services/amount.service';
import { DatePipe, NgIf } from '@angular/common';

@Component({
    selector: 'app-swift-short-detail',
    imports: [
        NgIf,
        DatePipe
    ],
    templateUrl: './swift-short-detail.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwiftShortDetailComponent {
  @Input() detail!: any;

  constructor(
    public amountService: AmountService,
  ) {
  }
}
