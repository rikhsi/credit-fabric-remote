import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ApplicationConditionsCard } from '../application-conditions-card/application-conditions-card';
import { DocsApplication } from '../../../../components';
import { OnlineApplication } from '@api/models/los/application';

@Component({
  selector: 'cf-view-signed',
  imports: [ApplicationConditionsCard, DocsApplication],
  templateUrl: './view-signed.html',
  styleUrl: './view-signed.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewSigned {
  application = input.required<OnlineApplication>();

  readonly docs = computed(() => this.application().docs ?? []);
}
