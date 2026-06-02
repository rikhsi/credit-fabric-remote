import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { AddressInfoItem } from './components';
import { Card } from '@shared/components';
import { isFlowAddressFilled } from '@pages/application/constants/address-type';
import { FlowAddressForm } from '@pages/application/models/form';

@Component({
  selector: 'cf-address-info',
  imports: [Card, NzIconDirective, NzTypographyComponent, NzTagComponent, TranslocoDirective, AddressInfoItem],
  templateUrl: './address-info.html',
  styleUrl: './address-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressInfo {
  readonly items = input<FlowAddressForm[]>([]);

  readonly hasIncomplete = computed(() => this.items().some((item) => !isFlowAddressFilled(item)));

  readonly edit = output<number>();
}
