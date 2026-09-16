import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card } from '@shared/components';
import { LoanLayoutBackConfig } from '@layouts/models';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-layout-header',
  imports: [Card, TranslocoDirective, NzIconDirective, NzButtonComponent, NzTypographyComponent, BounceDirective],
  templateUrl: './layout-header.html',
  styleUrl: './layout-header.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutHeader {
  private readonly router = inject(Router);

  title = input<string>();
  backConfig = input<LoanLayoutBackConfig>();

  closeClick = output<void>();

  goBack(): void {
    const link = this.backConfig()?.link;

    if (!link) {
      return;
    }

    if (link instanceof UrlTree) {
      void this.router.navigateByUrl(link);
      return;
    }

    if (Array.isArray(link)) {
      void this.router.navigate(link);
      return;
    }

    void this.router.navigateByUrl(link);
  }
}
