import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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

export const PAY_DAY_OPTIONS = Array.from({ length: 20 }, (_, index) => index + 1);

function isPayDaySelected(value: unknown): value is number {
  return typeof value === 'number' && value >= 1 && value <= 20;
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
})
export class ModalPayDay {
  private readonly modalRef = inject(NzModalRef<ModalPayDay, number | null>);

  readonly options = PAY_DAY_OPTIONS;

  readonly form = form(signal<{ payDay: number | null }>({ payDay: null }), (schemaPath) => {
    required(schemaPath.payDay);
    validate(schemaPath.payDay, ({ value }) => (isPayDaySelected(value()) ? null : requiredError()));
  });

  close(): void {
    this.modalRef.close(null);
  }

  submit(): void {
    markTreeAsDirty(this.form);
    this.form.payDay().markAsTouched();

    const payDay = this.form().value().payDay;

    if (!this.form().valid() || !isPayDaySelected(payDay)) {
      return;
    }

    this.modalRef.close(payDay);
  }
}
