import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApplicationConditionsCard } from '../application-conditions-card/application-conditions-card';
import { OnlineApplication } from '@api/models/los/application';

@Component({
  selector: 'cf-view-error',
  imports: [ApplicationConditionsCard],
  templateUrl: './view-error.html',
  styleUrl: './view-error.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewError {
  application = input.required<OnlineApplication>();
}
