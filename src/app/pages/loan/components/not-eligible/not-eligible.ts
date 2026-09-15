import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { BounceDirective } from '@shared/directives';
import { BANK_BRANCHES_URL } from '@app/constants/loan';

@Component({
  selector: 'cf-not-eligible',
  imports: [TranslocoDirective, NzButtonComponent, NzIconDirective, NzTypographyComponent, BounceDirective],
  templateUrl: './not-eligible.html',
  styleUrl: './not-eligible.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotEligible {
  findBranch(): void {
    window.open(BANK_BRANCHES_URL, '_blank', 'noopener,noreferrer');
  }
}
