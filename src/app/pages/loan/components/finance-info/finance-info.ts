import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { FinanceInfoItem } from './components';
import { Card } from '@shared/components';
import { BounceDirective } from '@shared/directives';
import { StartProcessingFinData } from '@api/models/los/start-processing';
import { isFinDataFilled } from '@pages/loan/utils/finance';

@Component({
  selector: 'cf-finance-info',
  imports: [
    Card,
    NzButtonComponent,
    NzIconDirective,
    NzSpinComponent,
    NzTypographyComponent,
    NzTagComponent,
    TranslocoDirective,
    FinanceInfoItem,
    BounceDirective,
  ],
  templateUrl: './finance-info.html',
  styleUrl: './finance-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceInfo {
  readonly item = input<StartProcessingFinData | null>(null);
  readonly isLoading = input(false);

  readonly isFilled = computed(() => isFinDataFilled(this.item()));

  readonly edit = output<void>();

  onFill(): void {
    if (this.isLoading()) {
      return;
    }

    this.edit.emit();
  }
}
