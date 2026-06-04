import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FlowForm } from '@pages/application/models/form';
import { ensureFinanceMonthDefaults, formatFinanceMonthPeriodLabel } from '@pages/application/constants/finance-months';
import { FlowService } from '@pages/application/services';
import { InputDefault, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';

@Component({
  selector: 'cf-finance-form',
  imports: [InputDefault, SelectDefault, NzOptionComponent, TranslocoDirective, HandbookDirective, FormField],
  templateUrl: './finance-form.html',
  styleUrl: './finance-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceForm implements OnInit {
  private readonly flowService = inject(FlowService);

  readonly form = input.required<FieldTree<FlowForm>>();

  readonly month1Label = computed(() => formatFinanceMonthPeriodLabel(this.form().finance.month1().value()));
  readonly month2Label = computed(() => formatFinanceMonthPeriodLabel(this.form().finance.month2().value()));
  readonly month3Label = computed(() => formatFinanceMonthPeriodLabel(this.form().finance.month3().value()));

  ngOnInit(): void {
    this.flowService.flowForm().value.update((cur) => ({
      ...cur,
      finance: ensureFinanceMonthDefaults(cur.finance),
    }));
  }
}
