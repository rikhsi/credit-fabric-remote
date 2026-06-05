import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FlowService } from '@pages/application/services';
import { InputDefault, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { OnlineCreateApplicationPayload } from '@api/models/los/online';
import { formatFinanceMonthPeriodLabel, ensureFinanceMonthDefaults } from '@pages/application/utils/finance-months';
import { PluralizePipe } from '@shared/pipes';

@Component({
  selector: 'cf-finance-form',
  imports: [InputDefault, SelectDefault, NzOptionComponent, TranslocoDirective, HandbookDirective, FormField, PluralizePipe],
  templateUrl: './finance-form.html',
  styleUrl: './finance-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceForm implements OnInit {
  private readonly flowService = inject(FlowService);

  readonly form = input.required<FieldTree<OnlineCreateApplicationPayload>>();

  readonly month1Label = computed(() => formatFinanceMonthPeriodLabel(this.form().finData.sysMonth1Id().value()));
  readonly month2Label = computed(() => formatFinanceMonthPeriodLabel(this.form().finData.sysMonth2Id().value()));
  readonly month3Label = computed(() => formatFinanceMonthPeriodLabel(this.form().finData.sysMonth3Id().value()));

  ngOnInit(): void {
    setTimeout(() => {
      this.flowService.flowForm().value.update((cur) => ({
        ...cur,
        finData: ensureFinanceMonthDefaults(cur.finData),
      }));
    }, 100);
  }
}
