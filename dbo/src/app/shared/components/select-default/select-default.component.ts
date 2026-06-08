import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef, ElementRef,
  forwardRef, HostListener,
  Injector,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { debounceTime, filter, switchMap, tap } from 'rxjs';
import { ValidationService } from 'src/app/core/services/validation.service';
import { FunctionType, SelectOption } from '../../types';
import { MatIconModule } from '@angular/material/icon';
import {TranslateModule} from "@ngx-translate/core";


export type SelectSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-select-default',
  standalone: true,
  templateUrl: './select-default.component.html',
  styleUrls: ['./select-default.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectDefaultComponent),
      multi: true,
    },
  ],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class SelectDefaultComponent
  implements ControlValueAccessor, AfterViewInit {
  value = model<number | string | boolean>();
  required = input<boolean>(false);
  backgroundColor = input<string>('white');
  color = input<string>('black')
  placeholder = input<string>('Выберите...');
  label = input<string>('');
  options = model<SelectOption<number | string | boolean>[]>([]);
  control = input<AbstractControl | null>();
  disabled = model<boolean>(false);
  errorMessage = model<string>('');
  opened = model<boolean>(false);
  activated = output<void>();
  closed = output<void>();
  isOpen = model<boolean>(false);
  size = input<SelectSize>('medium');
  readonly = input<boolean>(false);
  isTranslate = input<boolean>(false);

  onChange: FunctionType = () => { };
  onTouched: FunctionType = () => { };

  selectedLabel: string | null = null;
  selectedOption = signal<SelectOption<number | string | boolean> | null>(null);


  get triggerHeight(): string {
    switch (this.size()) {
      case 'small': return '40px';
      case 'medium': return '56px';
      case 'large': return '64px';
      default: return '56px';
    }
  }

  get placeholderFontSize(): string {
    switch (this.size()) {
      case 'small': return 'text-[14px]';
      case 'medium': return 'text-[14px]';
      case 'large': return 'text-[16px]';
      default: return 'text-[14px]';
    }
  }

  get borderRadiusClass(): string {
    switch (this.size()) {
      case 'small': return 'rounded-[12px]';
      default: return 'rounded-[16px]';
    }
  }

  get iconRightClass(): string {
    switch (this.size()) {
      case 'small': return 'right-3';
      default: return 'right-5';
    }
  }

  get itemFontSize(): string {
    return this.size() === 'small' ? 'text-[14px]' : 'text-[16px]';
  }

  get selectedFontSize(): string {
    switch (this.size()) {
      case 'small': return 'text-[14px]';
      case 'medium': return 'text-[16px]';
      case 'large': return 'text-[18px]';
      default: return 'text-[16px]';
    }
  }

  get itemHeight(): string {
    switch (this.size()) {
      case 'small': return 'h-[36px]';
      case 'medium': return 'h-[44px]';
      case 'large': return 'h-[48px]';
      default: return 'h-[44px]';
    }
  }

  get iconTop(): string {
    // Approximate centering: (height - assumed 16px icon) / 2
    const height = parseInt(this.triggerHeight);
    return `${(height - 16) / 2}px`;
  }

  get dropdownTop(): string {
    return `${parseInt(this.triggerHeight) + 8}px`; // top = height + 8 (for mt-2 equivalent)
  }

  constructor(
    private validationService: ValidationService,
    private destroyRef: DestroyRef,
    private injector: Injector,
    private elementRef: ElementRef,
  ) { }

  ngAfterViewInit(): void {
    this.listenValue();
    this.updateSelectedLabel();
  }

  writeValue(value: number | string | boolean): void {
    this.value.set(value);
    this.updateSelectedLabel();
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

  toggleDropdown(): void {
    if (this.disabled() || this.readonly()) {
      return;
    }

    this.isOpen.set(!this.isOpen());
  }

  setOption(option: SelectOption<number | string | boolean>): void {
    if (this.disabled() || this.readonly()) {
      return;
    }
    this.value.set(option.value);
    this.onModelChange(option.value);
    this.isOpen.set(false);
    this.updateSelectedLabel();
    this.onTouched();
    this.selectedOption.set(option)
  }

  onModelChange(event: number | string | boolean): void {
    this.onChange(event);
    this.updateSelectedLabel();
  }

  private updateSelectedLabel(): void {
    const currentValue = this.value();
    const selectedOption = this.options()?.find(opt => opt.value === currentValue);
    this.selectedLabel = selectedOption ? selectedOption.label : null;
  }

  onOpenedChange(opened: boolean): void {
    this.opened.set(opened);
    if (opened) {
      this.activated.emit();
    } else {
      this.closed.emit();
      this.onTouched();
    }
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

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.readonly()) return;
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInside && this.isOpen()) {
      this.isOpen.set(false);
      this.onTouched();
    }
  }
}
