import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { Card } from '@shared/components';
import { ExtraInfoItem } from '@pages/application/components/extra-info/components';
import { isFlowExtraInformationFilled } from '@pages/application/utils/flow-step.validation';
import { OnlineStartProcessingExtraInformation } from '@api/models/los/online';

@Component({
  selector: 'cf-extra-info',
  imports: [Card, NzButtonComponent, NzIconDirective, TranslocoDirective, ExtraInfoItem, NzTagComponent],
  templateUrl: './extra-info.html',
  styleUrl: './extra-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraInfo {
  readonly item = input<OnlineStartProcessingExtraInformation | null>(null);

  readonly isFilled = computed(() => {
    const value = this.item();
    return value != null && isFlowExtraInformationFilled(value);
  });

  readonly add = output<void>();
  readonly edit = output<void>();
}
