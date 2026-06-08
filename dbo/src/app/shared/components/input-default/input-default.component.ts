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
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, filter, switchMap, tap } from 'rxjs';
import { ValidationService } from 'src/app/core/services/validation.service';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel';
export type InputSize = 'small' | 'medium' | 'large';
export type FunctionType<T = string | number | boolean> = (value?: T) => void;

@Component({
  selector: 'app-input-default',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  styleUrls: ['./input-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDefaultComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full">
      <input [ngModel]="value()" (ngModelChange)="handleInputChange($event)" (blur)="onBlur()" [type]="type() === 'number' ? 'text' : type()"
        [placeholder]="placeholder()" [readonly]="readonly()" [disabled]="disabled()" [autocomplete]="autocomplete()"
        [ngClass]="{ 'border-red-500': controlInvalidAndTouched }" [class]="inputClasses" class="peer" [attr.inputmode]="type() === 'number' ? 'numeric' : null" />

      @if (label()) {
      <span [class]="labelClasses">
        {{ label() }}
        @if (required()) {
        <span class="text-red-500">*</span>
        }
      </span>
      }

      @if (controlInvalidAndTouched && errorMessage()) {
      <span [class]="errorClasses">
        {{ errorMessage() }}
      </span>
      }
    </div>
  `,
})
export class InputDefaultComponent implements ControlValueAccessor, AfterViewInit {
  value = model<string>('');
  required = input<boolean>(false);
  label = input<string>('');
  type = input<InputType>('text');
  placeholder = input<string>('');
  autocomplete = input<string>('off');
  disabled = model<boolean>(false);
  readonly = input<boolean>(false);
  control = input<AbstractControl | null>();
  errorMessage = model<string>('');
  size = input<InputSize>('medium');
  maxlength = input<number | null>(null);


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

  writeValue(value: any): void {
    this.value.set(value?.toString() || '');
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

  handleInputChange(event: string): void {
    let trimmedValue = event.trim();
    if (this.type() === 'number') {
      trimmedValue = trimmedValue.replace(/[^0-9]/g, '');
    }
    const max = this.maxlength();
    if (max && trimmedValue.length > max) {
      trimmedValue = trimmedValue.slice(0, max);
    }
    this.value.set(trimmedValue);
    this.onChange(trimmedValue);

    const activeElement = document.activeElement as HTMLInputElement | null;
    if (activeElement && activeElement.tagName === 'INPUT') {
      activeElement.value = trimmedValue;
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  get inputHeight(): string {
    switch (this.size()) {
      case 'small': return 'h-[40px]';
      case 'medium': return 'h-[56px]';
      case 'large': return 'h-[64px]';
      default: return 'h-[56px]';
    }
  }

  get inputTextSize(): string {
    switch (this.size()) {
      case 'small': return 'text-[12px]';
      case 'medium': return 'text-[14px]';
      case 'large': return 'text-[16px]';
      default: return 'text-[14px]';
    }
  }

  get inputPaddingTop(): string {
    switch (this.size()) {
      case 'small': return 'pt-3';
      case 'medium': return 'pt-4';
      case 'large': return 'pt-5';
      default: return 'pt-4';
    }
  }

  get paddingX(): string {
    switch (this.size()) {
      case 'small': return 'px-3';
      default: return 'px-4';
    }
  }

  get labelLeft(): string {
    switch (this.size()) {
      case 'small': return 'left-[12px]';
      default: return 'left-[15px]';
    }
  }

  get labelShownSize(): string {
    switch (this.size()) {
      case 'small': return 'text-[10px]';
      case 'medium': return 'text-[12px]';
      case 'large': return 'text-[14px]';
      default: return 'text-[12px]';
    }
  }

  get labelPlaceholderSize(): string {
    switch (this.size()) {
      case 'small': return 'text-[12px]';
      case 'medium': return 'text-[14px]';
      case 'large': return 'text-[16px]';
      default: return 'text-[14px]';
    }
  }

  get errorLeft(): string {
    return this.labelLeft;
  }

  get errorBottom(): string {
    switch (this.size()) {
      case 'small': return 'bottom-[-14px]';
      case 'medium': return 'bottom-[-18px]';
      case 'large': return 'bottom-[-22px]';
      default: return 'bottom-[-18px]';
    }
  }

  get inputClasses(): string {
    return `border focus:border-[#008C79] border-[#ECECED] bg-white w-full placeholder:text-transparent ${this.inputTextSize} text-[#101010] font-medium rounded-[16px] ${this.inputHeight} outline-none ${this.inputPaddingTop} ${this.paddingX}`;
  }

  get labelClasses(): string {
    return `absolute ${this.labelLeft} text-[#A3A3A3] transition-all peer-placeholder-shown:font-medium peer-focus:font-normal peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:${this.labelPlaceholderSize} peer-focus:top-[6px] peer-focus:-translate-y-0 peer-focus:${this.labelShownSize} top-[6px] ${this.labelShownSize}`;
  }

  get errorClasses(): string {
    return `absolute ${this.errorBottom} ${this.errorLeft} text-[12px] text-red-500`;
  }

  get controlInvalidAndTouched(): boolean {
    return !!(this.control()?.invalid && this.control()?.touched);
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
