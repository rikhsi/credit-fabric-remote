import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApplicationConditionsCard } from '../application-conditions-card/application-conditions-card';
import { OnlineApplication } from '@api/models/los/application';

@Component({
  selector: 'cf-view-issued',
  imports: [ApplicationConditionsCard],
  templateUrl: './view-issued.html',
  styleUrl: './view-issued.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewIssued {
  application = input.required<OnlineApplication>();
}
