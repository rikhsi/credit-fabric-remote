import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { AddressInfoItem } from './components';
import { Card } from '@shared/components';
import { OnlineStartProcessingAddress } from '@api/models/los/online';
import { isFlowAddressFilled } from '@pages/application/utils/address';

@Component({
  selector: 'cf-address-info',
  imports: [Card, NzIconDirective, NzTypographyComponent, NzTagComponent, TranslocoDirective, AddressInfoItem],
  templateUrl: './address-info.html',
  styleUrl: './address-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressInfo {
  readonly items = input<OnlineStartProcessingAddress[]>([]);

  readonly hasIncomplete = computed(() => this.items().some((item) => !isFlowAddressFilled(item)));

  readonly edit = output<number>();
}
