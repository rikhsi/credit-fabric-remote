import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApplicationConditionsCard } from '../application-conditions-card/application-conditions-card';
import { OnlineApplication } from '@api/models/los/application';

@Component({
  selector: 'cf-view-decline-client',
  imports: [ApplicationConditionsCard],
  templateUrl: './view-decline-client.html',
  styleUrl: './view-decline-client.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDeclineClient {
  application = input.required<OnlineApplication>();
}
