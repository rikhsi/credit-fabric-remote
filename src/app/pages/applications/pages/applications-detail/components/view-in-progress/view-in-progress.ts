import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApplicationConditionsCard } from '../application-conditions-card/application-conditions-card';
import { OnlineApplication } from '@api/models/los/application';

@Component({
  selector: 'cf-view-in-progress',
  imports: [ApplicationConditionsCard],
  templateUrl: './view-in-progress.html',
  styleUrl: './view-in-progress.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewInProgress {
  application = input.required<OnlineApplication>();
}
