import { DecimalPipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { ApplicationStatus, OnlineApplicationProduct, OnlineOffer } from '@api/models/los/application';
import { StatusApplication } from '../../../../components';
import { PluralizePipe } from '@shared/pipes';
import { calculateMonthlyPayment, calculateOverpayment, isDifferentialPaymentType } from '@shared/utils';

export type ConditionsSource = OnlineApplicationProduct | OnlineOffer;

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
  selector: 'cf-application-conditions-card',
  imports: [TranslocoDirective, StatusApplication, NzTypographyComponent, DecimalPipe, LowerCasePipe, PluralizePipe],
  templateUrl: './application-conditions-card.html',
  styleUrl: './application-conditions-card.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.highlighted]': 'highlighted()',
  },
})
export class ApplicationConditionsCard {
  source = input.required<ConditionsSource>();
  status = input<ApplicationStatus | null>(null);
  currency = input('UZS');
  showStatus = input(true);
  showRate = input(false);
  showOverpayment = input(false);
  highlighted = input(false);

  readonly statusTone = computed<StatusTone | null>(() => {
    const status = this.status();

    return status ? STATUS_TONE[status] : null;
  });

  readonly isDifferential = computed(() => isDifferentialPaymentType(this.source().paymentType));

  readonly monthlyPayment = computed(() => {
    const item = this.source();

    return calculateMonthlyPayment(item.loanAmount, item.loanTerm, item.loanRate, item.paymentType);
  });

  readonly overpayment = computed(() => {
    const item = this.source();

    return calculateOverpayment(item.loanAmount, item.loanTerm, item.loanRate, item.paymentType);
  });
}
