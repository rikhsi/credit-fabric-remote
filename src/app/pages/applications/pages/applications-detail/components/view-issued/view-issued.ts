import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ApplicationConditionsCard } from '../application-conditions-card/application-conditions-card';
import { DocsApplication } from '../../../../components';
import { OnlineApplication } from '@api/models/los/application';

@Component({
  selector: 'cf-view-issued',
  imports: [ApplicationConditionsCard, DocsApplication],
  templateUrl: './view-issued.html',
  styleUrl: './view-issued.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewIssued {
  application = input.required<OnlineApplication>();

  readonly docs = computed(() => this.application().docs ?? []);
}
