import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { form, required, validate } from '@angular/forms/signals';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { FormBox } from '@shared/components';
import { FinanceForm } from '@pages/application/components/finance-form/finance-form';
import { createDefaultFinanceForm, resolveFinanceMonthsForSubmit } from '@pages/application/utils/finance-months';
import { validateFinanceMonthRevenueIncome } from '@pages/application/utils/flow-step.validation';
import { OnlineStartProcessingFinData } from '@api/models/los/start-processing';

@Component({
  selector: 'cf-finance-modal',
  imports: [FormBox, FinanceForm, TranslocoDirective],
  templateUrl: './finance-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceModal implements OnInit {
  private readonly modalRef = inject(NzModalRef);
  private readonly nzModalData = inject<OnlineStartProcessingFinData | null>(NZ_MODAL_DATA, { optional: true });

  public readonly form = form(signal({ finData: createDefaultFinanceForm() }), (schemaPath) => {
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
        const finData = this.form().value().finData;

        return validateFinanceMonthRevenueIncome(finData[`month${month}Revenue` as const], finData[`month${month}Income` as const]);
      });
    };

    validateMonth(1);
    validateMonth(2);
    validateMonth(3);
  });

  public ngOnInit(): void {
    setTimeout(() => {
      this.form().value.update((cur) => ({
        finData: createDefaultFinanceForm({
          ...cur.finData,
          ...(this.nzModalData ?? {}),
        }),
      }));
    }, 0);
  }

  public close(): void {
    this.modalRef.close(null);
  }

  public submit(): void {
    if (this.form().valid()) {
      this.modalRef.close({
        ...this.form().value().finData,
        ...resolveFinanceMonthsForSubmit(),
      });
      return;
    }

    this.form().markAsDirty();
  }
}
