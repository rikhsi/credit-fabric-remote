import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { FormBox } from '@shared/components';
import { BounceDirective } from '@shared/directives';
import { BranchFormData } from '@pages/loan/models/branch-form';
import { SelectOption } from '@app/typings/select';

@Component({
  selector: 'cf-branch-form',
  imports: [
    FormBox,
    FormsModule,
    NgTemplateOutlet,
    NzIconDirective,
    NzInputModule,
    NzSpinComponent,
    TranslocoDirective,
    BounceDirective,
  ],
  templateUrl: './branch-form.html',
  styleUrl: './branch-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.inline]': 'inline()',
  },
})
export class BranchForm {
  private readonly modalRef = inject(NzModalRef, { optional: true });
  private readonly nzModalData = inject<BranchFormData | null>(NZ_MODAL_DATA, { optional: true });

  /** Parent loan form tree — when set, binds to `filialCode` in place (inline step). */
  readonly form = input<NzSafeAny>();
  readonly options = input<SelectOption[]>([]);
  readonly inline = input(false);
  readonly isLoading = input(false);

  public readonly isModal = this.modalRef != null;

  private readonly selected = signal<number | null>(this.nzModalData?.filialCode ?? null);
  readonly search = signal('');

  readonly branchOptions = computed(() => (this.isModal ? (this.nzModalData?.options ?? []) : this.options()));

  readonly loading = computed(() => (this.isModal ? Boolean(this.nzModalData?.isLoading) : this.isLoading()));

  readonly filteredOptions = computed(() => {
    const query = this.search().trim().toLowerCase();
    const options = this.branchOptions();

    if (!query) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(query));
  });

  readonly currentValue = computed(() => {
    if (this.isModal) {
      return this.selected();
    }

    return this.form()?.filialCode?.().value() ?? null;
  });

  public close(): void {
    this.modalRef?.close(null);
  }

  public submit(): void {
    const value = this.selected();

    if (value == null) {
      return;
    }

    this.modalRef?.close(value);
  }

  public selectOption(option: SelectOption): void {
    const value = Number(option.value);

    if (this.isModal) {
      this.selected.set(value);
      return;
    }

    this.form()?.().value.update((cur: { filialCode: number | null }) => ({
      ...cur,
      filialCode: value,
    }));
  }

  /** Used by the mobile step flow to validate in-place selection. */
  public validateInline(): boolean {
    return this.form()?.filialCode?.().value() != null;
  }
}
