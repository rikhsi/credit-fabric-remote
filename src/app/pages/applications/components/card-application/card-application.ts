import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { StatusApplication } from '../status-application/status-application';
import { BounceDirective } from '@shared/directives';
import { PluralizePipe } from '@shared/pipes';
import { calculateAnnuity, calculateDifferential } from '@shared/utils';
import { ApplicationStatus } from '@api/models/los/application';
import { CreditInput } from '@app/typings/calculator';

type StatusTone = 'warning' | 'success' | 'decline' | 'info';

const STATUS_TONE: Record<ApplicationStatus, StatusTone> = {
  [ApplicationStatus.InProgress]: 'warning',
  [ApplicationStatus.OnDesign]: 'info',
  [ApplicationStatus.OnFormFill]: 'warning',
  [ApplicationStatus.OnDecision]: 'success',
  [ApplicationStatus.Approved]: 'success',
  [ApplicationStatus.Signed]: 'success',
  [ApplicationStatus.Issued]: 'success',
  [ApplicationStatus.Decline]: 'decline',
  [ApplicationStatus.DeclineClient]: 'decline',
  [ApplicationStatus.Error]: 'decline',
};

@Component({
  selector: 'cf-card-application',
  imports: [
    StatusApplication,
    TranslocoDirective,
    DecimalPipe,
    PluralizePipe,
    NzIconDirective,
    NzButtonComponent,
    BounceDirective,
  ],
  templateUrl: './card-application.html',
  styleUrl: './card-application.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'card',
  },
})
export class CardApplication {
  id = input<number>();
  rate = input<number>();
  term = input<number>();
  amount = input<number>();
  currency = input<string>();
  status = input<ApplicationStatus>();
  paymentType = input<string>();

  actionsDisabled = input<boolean>();

  goToApplication = output<void>();

  readonly statusTone = computed(() => {
    const status = this.status();
    return status ? STATUS_TONE[status] : 'warning';
  });

  readonly isDifferential = computed(() => {
    const type = (this.paymentType() ?? '').toLowerCase();
    return type === 'standart';
  });

  readonly monthlyPayment = computed(() => {
    const amount = this.amount();
    const term = this.term();
    const annualRate = this.rate();

    if (!amount || !term || annualRate == null) {
      return null;
    }

    const input: CreditInput = { amount, term, annualRate };

    return this.isDifferential() ? calculateDifferential(input).monthlyPayment : calculateAnnuity(input).monthlyPayment;
  });
}
