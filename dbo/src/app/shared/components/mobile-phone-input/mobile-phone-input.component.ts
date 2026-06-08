import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-mobile-phone-input',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './mobile-phone-input.component.html',
  styleUrls: ['./mobile-phone-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MobilePhoneInputComponent),
      multi: true,
    },
  ],
})
export class MobilePhoneInputComponent implements ControlValueAccessor {
  @Input() required = true;
  @Input() label = 'Номер телефона';

  private _value = signal('');
  private _touched = signal(false);
  private _disabled = signal(false);

  onChange: (value: string) => void = () => { };
  onTouched: () => void = () => { };

  get value(): string {
    return this._value();
  }

  set value(val: string) {
    // Only allow digits
    const cleaned = val.replace(/\D/g, '');
    this._value.set(cleaned);
    this.onChange(cleaned);
    this._markAsTouched();
  }

  get disabled(): boolean {
    return this._disabled();
  }

  writeValue(value: string): void {
    if (value) {
      this._value.set(value);
    } else {
      this._value.set('');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    input.value = value;
    this.value = value;
  }

  onBlur(): void {
    this._markAsTouched();
  }

  private _markAsTouched(): void {
    if (!this._touched()) {
      this._touched.set(true);
      this.onTouched();
    }
  }

  hasError(): boolean {
    return this._touched() && this.required && this.value.length !== 9;
  }

  getFormattedValue(): string {
    const val = this.value;
    if (val.length === 0) return '';
    if (val.length <= 2) return val;
    if (val.length <= 5) return `${val.slice(0, 2)} ${val.slice(2)}`;
    if (val.length <= 7) return `${val.slice(0, 2)} ${val.slice(2, 5)} ${val.slice(5)}`;
    return `${val.slice(0, 2)} ${val.slice(2, 5)} ${val.slice(5, 7)} ${val.slice(7, 9)}`;
  }
}