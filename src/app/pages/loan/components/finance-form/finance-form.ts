import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FieldTree, form, FormField, required, validate } from '@angular/forms/signals';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { OnlineStartProcessingFinData } from '@api/models/los/start-processing';
import { FinanceMonthPipe } from '@pages/loan/pipes';
import { createDefaultFinanceForm, resolveFinanceMonthsForSubmit } from '@pages/loan/utils/finance-months';
import { isFinanceRevenueIncomeValid, validateFinanceMonthRevenueIncome } from '@pages/loan/utils/finance';
import { FormBox, InputDefault, LabelControlSecondary, SelectDefault, SelectDefaultMobile } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { PluralizePipe } from '@shared/pipes';

@Component({
  selector: 'cf-finance-form',
  imports: [
    FinanceMonthPipe,
    FormBox,
    InputDefault,
    LabelControlSecondary,
    SelectDefault,
    SelectDefaultMobile,
    NzOptionComponent,
    NzIconDirective,
    NzTagComponent,
    TranslocoDirective,
    HandbookDirective,
    FormField,
    PluralizePipe,
    DatePipe,
    NgTemplateOutlet,
  ],
  templateUrl: './finance-form.html',
  styleUrl: './finance-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceForm implements OnInit {
  private readonly modalRef = inject(NzModalRef, { optional: true });
  private readonly nzModalData = inject<OnlineStartProcessingFinData | null>(NZ_MODAL_DATA, { optional: true });

  readonly form = input<FieldTree<{ finData: OnlineStartProcessingFinData }>>();

  public readonly isModal = this.modalRef != null;

  public readonly localForm = form(signal({ finData: createDefaultFinanceForm() }), (schemaPath) => {
    required(schemaPath.finData.dirCompanyActivityId);
    required(schemaPath.finData.activityTerm);
    required(schemaPath.finData.month1Revenue);
    required(schemaPath.finData.month1Income);
    required(schemaPath.finData.month2Revenue);
    required(schemaPath.finData.month2Income);
    required(schemaPath.finData.month3Revenue);
    required(schemaPath.finData.month3Income);

    const validateMonth = (month: 1 | 2 | 3) => {
      validate(schemaPath.finData[`month${month}Income` as const], () => {
        const finData = this.localForm().value().finData;

        return validateFinanceMonthRevenueIncome(finData[`month${month}Revenue` as const], finData[`month${month}Income` as const]);
      });
    };

    validateMonth(1);
    validateMonth(2);
    validateMonth(3);
  });

  public readonly financeForm = computed(() => this.form() ?? this.localForm);

  readonly showRevenueIncomeAlert = computed(() => !isFinanceRevenueIncomeValid(this.financeForm()().value().finData));

  public ngOnInit(): void {
    if (!this.isModal) {
      return;
    }

    setTimeout(() => {
      this.localForm().value.update((cur) => ({
        finData: createDefaultFinanceForm({
          ...cur.finData,
          ...(this.nzModalData ?? {}),
        }),
      }));
    }, 0);
  }

  public close(): void {
    this.modalRef?.close(null);
  }

  public submit(): void {
    if (this.localForm().valid()) {
      this.modalRef?.close({
        ...this.localForm().value().finData,
        ...resolveFinanceMonthsForSubmit(),
      });
      return;
    }

    this.localForm().markAsDirty();
  }
}
