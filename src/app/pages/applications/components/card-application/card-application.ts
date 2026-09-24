import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { StatusApplication } from '../status-application/status-application';
import { BounceDirective } from '@shared/directives';
import { PluralizePipe } from '@shared/pipes';
import { calculateAnnuity, calculateDifferential } from '@shared/utils';
import { ApplicationStatus } from '@api/models/los/application';
import { CreditInput } from '@app/typings/calculator';

type StatusTone = 'warning' | 'success' | 'decline' | 'info' | 'signing';

const STATUS_TONE: Record<ApplicationStatus, StatusTone> = {
  [ApplicationStatus.InProgress]: 'warning',
  [ApplicationStatus.OnDesign]: 'signing',
  [ApplicationStatus.OnDecision]: 'success',
  [ApplicationStatus.Signed]: 'success',
  [ApplicationStatus.Issued]: 'success',
  [ApplicationStatus.Decline]: 'decline',
  [ApplicationStatus.DeclineClient]: 'decline',
  [ApplicationStatus.Error]: 'decline',
};

/** Temporary placeholder until backend starts returning createdDate. */
const PLACEHOLDER_CREATED_DATE = new Date(2026, 8, 12);

@Component({
  selector: 'cf-card-application',
  imports: [
    StatusApplication,
    TranslocoDirective,
    DecimalPipe,
    DatePipe,
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
    '[class.clickable]': '!actionsDisabled()',
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
  createdDate = input<string | Date | null>(null);

  actionsDisabled = input<boolean>();

  goToApplication = output<void>();

  readonly displayCurrency = computed(() => this.currency()?.trim() || 'UZS');

  readonly displayDate = computed(() => this.createdDate() || PLACEHOLDER_CREATED_DATE);

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
