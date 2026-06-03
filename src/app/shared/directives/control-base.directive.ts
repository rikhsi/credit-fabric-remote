import { computed, Directive, input, model, ModelSignal, output } from '@angular/core';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';
import { FormValueControl, ValidationError, WithOptionalField, DisabledReason } from '@angular/forms/signals';
import { errorCountBuilder } from '@shared/utils';
import { ValidationErrorData } from '@app/typings/validation';

@Directive()
export abstract class ControlBaseDirective<T> implements FormValueControl<T> {
  abstract readonly value: ModelSignal<T>;

  readonly errors = input<readonly WithOptionalField<ValidationError>[] | undefined>();
  readonly firstError = computed(() => this.errors()?.at(0) as ValidationErrorData);
  readonly errorCount = computed(() => errorCountBuilder(this.firstError()));

  readonly disabled = model<boolean>(false);

  readonly disabledReasons = input<readonly WithOptionalField<DisabledReason>[] | undefined>();

  readonly readonly = input<boolean>(false);

  readonly hidden = input<boolean>(false);

  readonly invalid = input<boolean>(false);

  readonly pending = input<boolean>(false);

  readonly touched = model<boolean>(false);

  readonly dirty = input<boolean>(false);

  readonly name = input<string>();

  readonly required = input<boolean>(false);

  readonly min = input<number | undefined>();

  readonly minLength = input<number | undefined>();

  readonly max = input<number | undefined>();

  readonly maxLength = input<number | undefined>();

  readonly pattern = input<readonly RegExp[] | undefined>();

  readonly id = input<string>();

  readonly placeholder = input<string | null>(null);

  readonly size = input<NzSizeLDSType>('default');

  readonly isFeedback = input<boolean>(false);

  readonly clicked = output<void>();

  readonly focusChange = output<void>();

  readonly blurChange = output<void>();

  onBlur(): void {
    this.touched.set(true);
    this.blurChange.emit();
  }
}
