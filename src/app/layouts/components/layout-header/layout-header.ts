import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { Card } from '@shared/components';
import { LoanLayoutBackConfig } from '@layouts/models';
import { BridgeService } from '@core/services';

@Component({
  selector: 'cf-layout-header',
  imports: [Card, TranslocoDirective, NzIconDirective, NzButtonComponent],
  templateUrl: './layout-header.html',
  styleUrl: './layout-header.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutHeader {
  bridgeService = inject(BridgeService);

  title = input<string>();
  backConfig = input<LoanLayoutBackConfig>();

  closeClick = output<void>();
}
