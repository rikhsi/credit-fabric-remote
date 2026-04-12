import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card } from '@shared/components';

@Component({
  selector: 'cf-address-info',
  imports: [Card, NzButtonComponent, NzIconDirective, NzTypographyComponent],
  templateUrl: './address-info.html',
  styleUrl: './address-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressInfo {
  readonly edit = output<void>();
}
