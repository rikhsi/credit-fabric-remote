import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApplicationConditionsCard } from '../application-conditions-card/application-conditions-card';
import { OnlineApplication } from '@api/models/los/application';

@Component({
  selector: 'cf-view-decline',
  imports: [ApplicationConditionsCard],
  templateUrl: './view-decline.html',
  styleUrl: './view-decline.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDecline {
  application = input.required<OnlineApplication>();
}
