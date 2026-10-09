import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { StartProcessingFinData } from '@api/models/los/start-processing';
import { FinanceMonthPipe } from '@pages/loan/pipes';
import { createDefaultFinanceForm, resolveFinanceMonthsForSubmit } from '@pages/loan/utils/finance-months';
import { validateActivityTermMin, validateFinanceMonthRevenueIncome } from '@pages/loan/utils/finance';
import { FormBox, InfoModal, InputDefault, LabelControlSecondary, SelectDefault, SelectDefaultMobile } from '@shared/components';
import { HandbookDirective } from '@shared/directives';
import { PluralizePipe } from '@shared/pipes';
import { markTreeAsDirty } from '@shared/utils';
import { InfoModalData } from '@app/typings/modal';

type MonthSlot = 1 | 2 | 3;

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
  host: {
    '[class.inline]': 'inline()',
    '[class.collapsible]': 'collapsible()',
  },
})
export class FinanceForm {
  private readonly modalRef = inject(NzModalRef, { optional: true });
  private readonly nmService = inject(NzModalService);
  private readonly nzModalData = inject<StartProcessingFinData | null>(NZ_MODAL_DATA, { optional: true });

  readonly form = input<NzSafeAny>();
  readonly inline = input(false);
  readonly collapsible = input(false);

  public readonly isModal = this.modalRef != null;

  public readonly localForm = form(signal({ finData: createDefaultFinanceForm(this.nzModalData) }), (schemaPath) => {
    required(schemaPath.finData.dirCompanyActivityId);
    required(schemaPath.finData.activityTerm);
    validate(schemaPath.finData.activityTerm, ({ value }) => validateActivityTermMin(value()));
    required(schemaPath.finData.month1Revenue);
    required(schemaPath.finData.month1Income);
    required(schemaPath.finData.month2Revenue);
    required(schemaPath.finData.month2Income);
    required(schemaPath.finData.month3Revenue);
    required(schemaPath.finData.month3Income);

    validate(schemaPath.finData.month1Income, ({ valueOf }) =>
      validateFinanceMonthRevenueIncome(valueOf(schemaPath.finData.month1Revenue), valueOf(schemaPath.finData.month1Income)),
    );
    validate(schemaPath.finData.month2Income, ({ valueOf }) =>
      validateFinanceMonthRevenueIncome(valueOf(schemaPath.finData.month2Revenue), valueOf(schemaPath.finData.month2Income)),
    );
    validate(schemaPath.finData.month3Income, ({ valueOf }) =>
      validateFinanceMonthRevenueIncome(valueOf(schemaPath.finData.month3Revenue), valueOf(schemaPath.finData.month3Income)),
    );
  });

  public readonly financeForm = computed(() => this.form() ?? this.localForm);

  readonly expandedMonths = signal<Record<MonthSlot, boolean>>({ 1: true, 2: false, 3: false });

  isMonthExpanded(month: MonthSlot): boolean {
    return !this.collapsible() || this.expandedMonths()[month];
  }

  toggleMonth(month: MonthSlot): void {
    if (!this.collapsible()) {
      return;
    }

    this.expandedMonths.update((cur) => ({ ...cur, [month]: !cur[month] }));
  }

  expandMonth(month: MonthSlot): void {
    if (!this.collapsible() || this.expandedMonths()[month]) {
      return;
    }

    this.expandedMonths.update((cur) => ({ ...cur, [month]: true }));
  }

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

  public validateInline(): boolean {
    // Inline binds the parent loan form — only finData must pass to leave this step.
    const tree = this.financeForm().finData;

    if (tree().valid()) {
      return true;
    }

    markTreeAsDirty(tree);
    this.expandInvalidMonths();
    return false;
  }

  /** Collapsed month cards hide field errors — open any month with invalid income/revenue. */
  private expandInvalidMonths(): void {
    if (!this.collapsible()) {
      return;
    }

    const finData = this.financeForm().finData;
    const next = { ...this.expandedMonths() };

    ([1, 2, 3] as MonthSlot[]).forEach((month) => {
      const income = finData[`month${month}Income` as const];
      const revenue = finData[`month${month}Revenue` as const];

      if (income?.().invalid() || revenue?.().invalid()) {
        next[month] = true;
      }
    });

    this.expandedMonths.set(next);
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
