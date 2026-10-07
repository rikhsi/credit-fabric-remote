import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { form, FormField, required, requiredError, validate } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { SelectDefault } from '@shared/components';
import { BounceDirective } from '@shared/directives';
import { markTreeAsDirty } from '@shared/utils';

export const PAY_DAY_MAX = 25;
export const PAY_DAY_OPTIONS = Array.from({ length: PAY_DAY_MAX }, (_, index) => index + 1);

function isPayDaySelected(value: unknown): value is number {
  return typeof value === 'number' && value >= 1 && value <= PAY_DAY_MAX;
}

@Component({
  selector: 'cf-modal-pay-day',
  imports: [
    TranslocoDirective,
    NzButtonComponent,
    NzIconDirective,
    NzOptionComponent,
    NzTypographyComponent,
    SelectDefault,
    BounceDirective,
    FormField,
  ],
  templateUrl: './modal-pay-day.html',
  styleUrl: './modal-pay-day.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.inline]': 'inline()',
  },
})
export class ModalPayDay {
  private readonly modalRef = inject(NzModalRef<ModalPayDay, number | null>, { optional: true });

  readonly inline = input(false);
  /** Emitted in inline mode: selected day, or `null` when cancelled. */
  readonly confirmed = output<number | null>();

  readonly options = PAY_DAY_OPTIONS;

  readonly form = form(signal<{ payDay: number | null }>({ payDay: null }), (schemaPath) => {
    required(schemaPath.payDay);
    validate(schemaPath.payDay, ({ value }) => (isPayDaySelected(value()) ? null : requiredError()));
  });

  currentValue(): number | null {
    return this.form().value().payDay;
  }

  selectDay(day: number): void {
    this.form().value.update((current) => ({ ...current, payDay: day }));
  }

  close(): void {
    if (this.inline()) {
      this.confirmed.emit(null);
      return;
    }

    this.modalRef?.close(null);
  }

  submit(): void {
    markTreeAsDirty(this.form);
    this.form.payDay().markAsTouched();

    const payDay = this.form().value().payDay;

    if (!this.form().valid() || !isPayDaySelected(payDay)) {
      return;
    }

    if (this.inline()) {
      this.confirmed.emit(payDay);
      return;
    }

    this.modalRef?.close(payDay);
  }
}
