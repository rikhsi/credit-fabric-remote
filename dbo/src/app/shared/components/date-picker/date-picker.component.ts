import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  forwardRef,
  Injector,
  input,
  model,
} from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { filter, switchMap, debounceTime, tap } from 'rxjs';
import { ValidationService } from 'src/app/core/services/validation.service';

export type FunctionType<T = string | number | boolean> = (value?: T) => void;

@Component({
  selector: 'app-date-picker',
  standalone: true,
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent
  implements ControlValueAccessor, AfterViewInit {
  value = model<Date | null>(null);
  label = input<string>('');
  placeholder = input<string>('Выберите дату');
  disabled = model<boolean>(false);
  errorMessage = model<string>('');
  control = input<AbstractControl | null>();
  required = input<boolean>(false);
  minDate = input<Date | null>(null);
  maxDate = input<Date | null>(null);

  onChange: FunctionType = () => { };
  onTouched: FunctionType = () => { };

  constructor(
    private validationService: ValidationService,
    private destroyRef: DestroyRef,
    private injector: Injector,
  ) { }

  ngAfterViewInit(): void {
    this.listenValue();
  }

  writeValue(value: Date | string | number | null): void {
    if (value) {
      // Handle different date formats
      if (typeof value === 'string' || typeof value === 'number') {
        this.value.set(new Date(value));
      } else {
        this.value.set(value);
      }
    } else {
      this.value.set(null);
    }
  }

  registerOnChange(fn: FunctionType): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: FunctionType): void {
    this.onTouched = fn;
  }

  setDisabledState(state: boolean): void {
    this.disabled.set(state);
  }

  onModelChange(date: Date | null): void {
    this.onChange(date?.toDateString());//!! converted date to string because of error later when you have time do better
  }

  onBlur(): void {
    this.onTouched();
  }

  hasError(): boolean {
    return this.validationService.hasError(this.control());
  }

  private listenValue(): void {
    toObservable(this.control, { injector: this.injector })
      .pipe(
        filter((control) => !!control),
        switchMap((control) => control!.valueChanges),
        debounceTime(100),
        tap(() => {
          this.errorMessage.set(
            this.validationService.validateField(this.control()),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}