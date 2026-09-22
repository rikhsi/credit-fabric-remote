import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card } from '@shared/components';
import { LoanLayoutBackConfig } from '@layouts/models';
import { LoanLayoutService } from '@layouts/services';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-layout-header',
  imports: [Card, TranslocoDirective, NzIconDirective, NzButtonComponent, NzTypographyComponent, BounceDirective],
  templateUrl: './layout-header.html',
  styleUrl: './layout-header.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutHeader {
  private readonly loanLayoutService = inject(LoanLayoutService);

  title = input<string>();
  backConfig = input<LoanLayoutBackConfig>();

  closeClick = output<void>();

  goBack(): void {
    if (!this.backConfig()?.link) {
      return;
    }

    this.loanLayoutService.emitBackClick();
  }
}
