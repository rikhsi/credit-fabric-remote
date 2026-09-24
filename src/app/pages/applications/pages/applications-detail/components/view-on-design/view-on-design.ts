import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ApplicationConditionsCard } from '../application-conditions-card/application-conditions-card';
import { DocsApplication } from '../../../../components';
import { OnlineApplication } from '@api/models/los/application';

@Component({
  selector: 'cf-view-on-design',
  imports: [ApplicationConditionsCard, DocsApplication],
  templateUrl: './view-on-design.html',
  styleUrl: './view-on-design.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewOnDesign {
  application = input.required<OnlineApplication>();

  readonly docs = computed(() => this.application().docs ?? []);
}
