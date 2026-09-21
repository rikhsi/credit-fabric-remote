import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FieldTree, form, FormField, required, validate } from '@angular/forms/signals';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { OnlineStartProcessingFinData } from '@api/models/los/start-processing';
import { FinanceMonthPipe } from '@pages/loan/pipes';
import { createDefaultFinanceForm, resolveFinanceMonthsForSubmit } from '@pages/loan/utils/finance-months';
import { validateFinanceMonthRevenueIncome } from '@pages/loan/utils/finance';
import { FormBox, InfoModal, InputDefault, LabelControlSecondary, SelectDefault, SelectDefaultMobile } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { PluralizePipe } from '@shared/pipes';
import { markTreeAsDirty } from '@shared/utils';
import { InfoModalData } from '@app/typings/modal';

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
    TranslocoDirective,
    HandbookDirective,
    FormField,
    DatePipe,
    NgTemplateOutlet,
    PluralizePipe,
  ],
  templateUrl: './finance-form.html',
  styleUrl: './finance-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceForm {
  private readonly modalRef = inject(NzModalRef, { optional: true });
  private readonly nmService = inject(NzModalService);
  private readonly nzModalData = inject<OnlineStartProcessingFinData | null>(NZ_MODAL_DATA, { optional: true });

  readonly form = input<FieldTree<{ finData: OnlineStartProcessingFinData }>>();

  public readonly isModal = this.modalRef != null;

  public readonly localForm = form(signal({ finData: createDefaultFinanceForm(this.nzModalData) }), (schemaPath) => {
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

  public openBusinessActivityInfo(): void {
    this.openInfoModal({
      title: 'prop.business_activity',
      descriptions: ['modal.business_activity.description'],
    });
  }

  public openActivityTermInfo(): void {
    this.openInfoModal({
      title: 'prop.activity_term',
      descriptions: ['modal.activity_term.description'],
    });
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

    markTreeAsDirty(this.localForm);
  }

  private openInfoModal(nzData: InfoModalData): void {
    this.nmService.create<InfoModal, InfoModalData>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: InfoModal,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzData,
    });
  }
}
