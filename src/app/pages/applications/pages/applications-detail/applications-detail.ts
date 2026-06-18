import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ViewDecline,
  ViewDeclineClient,
  ViewError,
  ViewInProgress,
  ViewIssued,
  ViewOnDecision,
  ViewOnDesign,
  ViewSigned,
} from './components';
import { ApplicationStatus } from '@api/models/los/application';
import { OnlineGetInfoResult } from '@api/models/los/online';

@Component({
  selector: 'cf-applications-detail',
  imports: [ViewInProgress, ViewDecline, ViewError, ViewOnDesign, ViewOnDecision, ViewSigned, ViewIssued, ViewDeclineClient],
  templateUrl: './applications-detail.html',
  styleUrl: './applications-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsDetail {
  readonly application = signal<OnlineGetInfoResult>({
    id: 1,
    creditAgreementId: 0,
    decisionId: 0,
    currency: 'UZS',
    loanAmount: 50_000_000,
    loanTerm: 18,
    paymentType: 'annuity',
    productName: 'Biznesga qadam',
    rate: 25,
    sysStatusId: ApplicationStatus.OnDecision,
    docs: [],
  });

  readonly status = ApplicationStatus;
}
