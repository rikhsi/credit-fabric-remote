import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { OnlineApplication } from '@api/models/los/application';
import { offerValidUntil } from '../../../../utils/offer-valid-until';

@Component({
  selector: 'cf-application-branch-alert',
  imports: [TranslocoDirective, NzIconDirective, NzTagComponent],
  templateUrl: './application-branch-alert.html',
  styleUrl: './application-branch-alert.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationBranchAlert {
  private readonly localeId = inject(LOCALE_ID);

  application = input.required<OnlineApplication>();

  readonly branch = computed(() => this.application().filialAddress?.trim() || null);
  readonly phone = computed(() => this.application().filialPhoneNumber?.trim() || null);
  readonly hours = computed(() => this.application().filialOpenHours?.trim() || null);
  readonly validUntilLabel = computed(() => {
    const until = offerValidUntil(this.application().updateDate);

    return until ? formatDate(until, 'd MMMM y', this.localeId) : null;
  });
}
