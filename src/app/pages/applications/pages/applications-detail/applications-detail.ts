import { ChangeDetectionStrategy, Component } from '@angular/core';
import { APPLICATION_DETAIL_MOCK } from './applications-detail.mock';
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

@Component({
  selector: 'cf-applications-detail',
  imports: [ViewInProgress, ViewDecline, ViewError, ViewOnDesign, ViewOnDecision, ViewSigned, ViewIssued, ViewDeclineClient],
  templateUrl: './applications-detail.html',
  styleUrl: './applications-detail.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsDetail {
  readonly mock = APPLICATION_DETAIL_MOCK;
  readonly status = ApplicationStatus;
}
