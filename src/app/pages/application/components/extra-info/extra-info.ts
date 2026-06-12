import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { FieldTree } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { Card } from '@shared/components';
import { ExtraInfoItem } from '@pages/application/components/extra-info/components';
import { OnlineCreateApplicationPayload, OnlineStartProcessingExtraInformation } from '@api/models/los/start-processing';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-extra-info',
  imports: [Card, NzButtonComponent, NzIconDirective, TranslocoDirective, ExtraInfoItem, NzTagComponent, BounceDirective],
  templateUrl: './extra-info.html',
  styleUrl: './extra-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraInfo {
  readonly item = input<OnlineStartProcessingExtraInformation | null>(null);
  readonly form = input.required<FieldTree<OnlineCreateApplicationPayload>>();

  readonly add = output<void>();
  readonly edit = output<void>();
}
