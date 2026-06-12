import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card } from '@shared/components';
import { BounceDirective, HandbookDirective } from '@shared/directives';
import { HandbookPipe } from '@shared/pipes';
import { OnlineStartProcessingAddress } from '@api/models/los/start-processing';
import { isFlowAddressFilled } from '@pages/application/utils/address';

@Component({
  selector: 'cf-address-info-item',
  imports: [Card, NzButtonComponent, NzIconDirective, NzTypographyComponent, HandbookDirective, HandbookPipe, BounceDirective],
  templateUrl: './address-info-item.html',
  styleUrl: './address-info-item.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressInfoItem {
  readonly item = input.required<OnlineStartProcessingAddress>();

  readonly edit = output<void>();

  readonly isFilled = computed(() => isFlowAddressFilled(this.item()));
}
