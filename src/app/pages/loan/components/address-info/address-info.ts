import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { AddressInfoItem } from './components';
import { Card } from '@shared/components';
import { BounceDirective } from '@shared/directives';
import { OnlineStartProcessingAddress } from '@api/models/los/start-processing';
import { isFlowAddressFilled } from '@pages/loan/utils/address';

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
    AddressInfoItem,
    BounceDirective,
  ],
  templateUrl: './address-info.html',
  styleUrl: './address-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressInfo {
  readonly items = input<OnlineStartProcessingAddress[]>([]);
  readonly isLoading = input(false);

  readonly hasIncomplete = computed(() => this.items().some((item) => !isFlowAddressFilled(item)));
  readonly firstIncompleteIndex = computed(() => this.items().findIndex((item) => !isFlowAddressFilled(item)));

  readonly edit = output<number>();

  onFill(): void {
    if (this.isLoading()) {
      return;
    }

    this.edit.emit(this.firstIncompleteIndex());
  }
}
