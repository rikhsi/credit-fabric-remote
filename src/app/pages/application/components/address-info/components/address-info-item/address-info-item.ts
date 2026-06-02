import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { HandbookPipe } from '@shared/pipes';
import { isFlowAddressFilled } from '@pages/application/constants/address-type';
import { FlowAddressForm } from '@pages/application/models/form';

@Component({
  selector: 'cf-address-info-item',
  imports: [Card, NzButtonComponent, NzIconDirective, NzTypographyComponent, HandbookDirective, HandbookPipe],
  templateUrl: './address-info-item.html',
  styleUrl: './address-info-item.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressInfoItem {
  readonly item = input.required<FlowAddressForm>();
  readonly showInvalid = input(false);

  readonly edit = output<void>();

  readonly isFilled = computed(() => isFlowAddressFilled(this.item()));
}
