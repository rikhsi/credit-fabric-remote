import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { Card } from '@shared/components';
import { BounceDirective, HandbookDirective } from '@shared/directives';
import { HandbookPipe } from '@shared/pipes';
import { OnlineStartProcessingAddress } from '@api/models/los/start-processing';
import { isFlowAddressFilled } from '@pages/loan/utils/address';
import { AddressLinePipe } from '@pages/loan/pipes';

@Component({
  selector: 'cf-address-info',
  imports: [
    Card,
    NzButtonComponent,
    NzIconDirective,
    NzSpinComponent,
    NzTypographyComponent,
    NzTagComponent,
    TranslocoDirective,
    BounceDirective,
    HandbookDirective,
    HandbookPipe,
    AddressLinePipe,
  ],
  templateUrl: './address-info.html',
  styleUrl: './address-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressInfo {
  readonly item = input<OnlineStartProcessingAddress | null>(null);
  readonly isLoading = input(false);

  readonly isFilled = computed(() => {
    const item = this.item();

    return item != null && isFlowAddressFilled(item);
  });

  readonly edit = output<void>();

  onFill(): void {
    if (this.isLoading()) {
      return;
    }

    this.edit.emit();
  }
}
