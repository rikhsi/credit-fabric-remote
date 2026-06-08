import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  forwardRef,
  Injector,
  input,
  model,
  OnInit,
  inject,
  signal,
  computed,
  ViewChild,
  // ChangeDetectorRef,
  // NgZone,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
} from '@angular/forms';
import {CommonModule, NgClass} from '@angular/common';
import {MAT_DATE_RANGE_SELECTION_STRATEGY, MatDatepickerModule, MatDateRangePicker} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatNativeDateModule} from '@angular/material/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {debounceTime, filter, switchMap, tap} from 'rxjs';
import {ValidationService} from 'src/app/core/services/validation.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {PreviewRangeSelectionStrategy} from './range-selection.strategy';

export type DatePickerMode = 'single' | 'range';
export type InputSize = 'small' | 'medium' | 'large' | 'pre-medium';
export type FunctionType<T = any> = (value?: T) => void;

// const CUSTOM_DATE_FORMATS = {
//   parse: { dateInput: 'dd.MM.yyyy' },
//   display: {
//     dateInput: 'dd.MM.yyyy',
//     monthYearLabel: 'MMM yyyy',
//     dateA11yLabel: 'dd.MM.yyyy',
//     monthYearA11yLabel: 'MMMM yyyy',
//   },
// };

@Component({
  selector: 'app-datepicker-default',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgClass,
    TranslateModule,
    // AsyncPipe
  ],
  styleUrls: ['./date-picker-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatePickerDefaultComponent), multi: true},
    // {provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS},
    {provide: MAT_DATE_RANGE_SELECTION_STRATEGY, useClass: PreviewRangeSelectionStrategy},
  ],
  template: `
    <div class="relative w-full"
         [ngClass]="['datepicker-size-' + size(), (showSeparator()) ? 'show-separator' : 'hide-separator', pickerOpen() ? 'picker-is-open' : '']"
    >
      @if (isRange) {
        <mat-form-field class="w-full" appearance="outline" [class]="inputClasses" [class.ng-invalid]="hasError()"
                        (click)="picker.open()">
          @if (label()) {
            <mat-label [class]="labelClasses">
              {{ label() }}
              @if (required()) {
                <span class="text-red-500 ml-1">*</span>
              }
            </mat-label>
          }

          <mat-date-range-input [rangePicker]="picker" [formGroup]="rangeForm" [min]="minDate()" [max]="maxDate()">
            <input matStartDate formControlName="start" [placeholder]="placeholderLabel() | translate"
                   readonly matInput class="peer"
                   (dateInput)="onStartChange($event)"/>

            <input matEndDate formControlName="end" readonly matInput class="peer"
                   (dateInput)="onEndChange($event)"/>
          </mat-date-range-input>

          <mat-datepicker-toggle matIconSuffix [for]="picker">
            <svg matDatepickerToggleIcon width="24" height="24" viewBox="0 0 24 24" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 10L3 10M16 2V6M8 2V6M7.8 22L16.2 22C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2L21 8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4L7.8 4C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8L3 17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
                stroke="#171717" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </mat-datepicker-toggle>

          <mat-date-range-picker #picker
                                 (opened)="pickerOpen.set(true)"
                                 (closed)="pickerOpen.set(false); onTouched()">
            <mat-date-range-picker-actions>
              <div class="w-full py-1">
                <div class="flex gap-3 mb-3 px-[8px]">
                  <div
                    class="flex-1 h-[32px] border border-custom-soft-200 flex items-center px-[9px] py-[6px] bg-surface-4 rounded-xl text-sm text-custom-primary">
                    {{ rangeStart() ? formatDate(rangeStart()) : ('new_third.from' | translate) }}
                  </div>
                  <div
                    class="flex-1 h-[32px] border border-custom-soft-200 flex items-center px-[9px] py-[6px] bg-surface-4 rounded-xl text-sm text-custom-primary">
                    {{ rangeEnd() ? formatDate(rangeEnd()) : (rangeStart() ? formatDate(rangeStart()) : ('new_third.to' | translate)) }}
                  </div>
                </div>
                <div class="h-[1px] bg-[#EBEBEB] w-full my-2">
                </div>
                <div class="flex  px-2 w-full gap-3">
                  <button class="h-[32px] bg-[#F5F5F5] text-[#171717] rounded-xl w-1/2 text-xs"
                          matDateRangePickerCancel>{{ 'new_third.cancel' | translate }}
                  </button>
                  <button class="h-[32px] bg-[#00A38D] text-[#FFFFFF] rounded-xl w-1/2 text-xs" matDateRangePickerApply
                          (click)="onApply()">{{ 'new_third.apply' | translate }}
                  </button>
                </div>
              </div>
            </mat-date-range-picker-actions>
          </mat-date-range-picker>

          @if (hasError() && errorMessage()) {
            <mat-error [class]="errorClasses">{{ errorMessage() }}</mat-error>
          }
        </mat-form-field>
      } @else {
        <mat-form-field class="w-full" appearance="outline" [class]="inputClasses" [class.ng-invalid]="hasError()"
                        (click)="picker.open()">
          @if (label()) {
            <mat-label [class]="labelClasses">
              {{ label() }}
              @if (required()) {
                <span class="text-red-500 ml-1">*</span>
              }
            </mat-label>
          }

          <input matInput [matDatepicker]="picker" [formControl]="singleControl"
                 [placeholder]="placeholder() | translate" readonly class="peer"/>

          <mat-datepicker-toggle matIconSuffix [for]="picker">
            <svg matDatepickerToggleIcon width="24" height="24" viewBox="0 0 24 24" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 10L3 10M16 2V6M8 2V6M7.8 22L16.2 22C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2L21 8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4L7.8 4C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8L3 17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
                stroke="#171717" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </mat-datepicker-toggle>
          <mat-datepicker #picker
                          (opened)="pickerOpen.set(true)"
                          (closed)="pickerOpen.set(false); onTouched()"></mat-datepicker>

          @if (hasError() && errorMessage()) {
            <mat-error [class]="errorClasses">{{ errorMessage() }}</mat-error>
          }
        </mat-form-field>


      }
    </div>
  `,
})
export class DatePickerDefaultComponent implements ControlValueAccessor, AfterViewInit, OnInit {

  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  private validationService = inject(ValidationService);
  private translate = inject(TranslateService)
  private rangeStrategy = inject(MAT_DATE_RANGE_SELECTION_STRATEGY) as PreviewRangeSelectionStrategy;

// private cdr = inject(ChangeDetectorRef);
// private ngZone = inject(NgZone);


  // Inputs
  required = input<boolean>(false);
  label = input<string>('');
  mode = input<DatePickerMode>('single');
  placeholder = input<string>('accounts.period');
  placeholderLabel = signal<string>('accounts.period');
  // placeholder = input<string>('global.choose_date');
  // placeholderLabel = signal<string>('global.choose_date');
  placeholderFrom = input<string>('От');
  placeholderTo = input<string>('До');
  disabled = model<boolean>(false);
  control = input<AbstractControl | null>();
  errorMessage = model<string>('');
  size = input<InputSize>('medium');
  minDate = input<Date | null>(null);
  maxDate = input<Date | null>(null);
  @ViewChild('picker') picker!: MatDateRangePicker<any>;


  previewTop = signal('0px');
  previewLeft = signal('0px');


  rangeForm = this.fb.group({
    start: this.fb.control<Date | null>(null),
    end: this.fb.control<Date | null>(null),
  });


  singleControl: FormControl<Date | null> = new FormControl(null);
  rangeStart = signal<Date | null>(null);
  rangeEnd = signal<Date | null>(null);
  pickerOpen = signal(false);
  showSeparator = computed(() => !!(this.rangeStart() && this.rangeEnd()));

  ngOnInit(): void {
    if (this.isRange) {
      this.placeholderLabel.set(this.placeholder())
      this.rangeForm = this.fb.group({
        start: this.fb.control<Date | null>(null),
        end: this.fb.control<Date | null>(null),
      });

      this.rangeStrategy.onSelectionChanged = (start, end) => {
        this.rangeStart.set(start);
        this.rangeEnd.set(end);
      };

      this.rangeForm.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((val) => {
          console.log('val', val)
          this.onChange(val);
        });
    } else {
      this.singleControl = this.fb.control<Date | null>(null);

      this.singleControl.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((val) => this.onChange(val));
    }

  }

  ngAfterViewInit(): void {
    this.listenValue();

  }

  onPickerOpened(): void {
    this.pickerOpen.set(true);

    setTimeout(() => {
      const panel = document.querySelector('.mat-datepicker-content');
      if (panel) {
        const rect = panel.getBoundingClientRect();
        this.previewTop.set(`${rect.top + 8}px`);
        this.previewLeft.set(`${rect.left + 8}px`);
      }
    });
  }


  onStartChange(event: any): void {
    this.rangeStart.set(event.value ?? null);
    this.rangeEnd.set(null);
  }

  onEndChange(event: any): void {
    this.rangeEnd.set(event.value ?? null);
  }

  formatDate(date: Date | null): string {
    if (!date) return '';

    const translateMonths = [
      'months.january', 'months.february', 'months.march',
      'months.april', 'months.may', 'months.june',
      'months.july', 'months.august', 'months.september',
      'months.october', 'months.november', 'months.december'
    ];

    const monthKey = translateMonths[date.getMonth()];
    const monthName = this.translate.instant(monthKey);
    // Take first 3 chars for abbreviation
    const shortMonth = monthName.length > 3 ? monthName.slice(0, 3) : monthName;

    return `${date.getDate()} ${shortMonth}, ${date.getFullYear()}`;
  }


  // ControlValueAccessor handlers
  onChange: FunctionType = () => {
  };
  onTouched: FunctionType = () => {
  };

  get isRange(): boolean {
    return this.mode() === 'range';
  }

  // --- Dynamic style getters (same as before) ---
  // get inputHeight(): string {
  //   switch (this.size()) {
  //     case 'small': return 'h-[40px]';
  //     case 'medium': return 'h-[56px]';
  //     case 'large': return 'h-[64px]';
  //     default: return 'h-[56px]';
  //   }
  // }

  // get inputTextSize(): string {
  //   switch (this.size()) {
  //     case 'small': return 'text-[12px]';
  //     case 'medium': return 'text-[14px]';
  //     case 'large': return 'text-[16px]';
  //     default: return 'text-[14px]';
  //   }
  // }

  // get inputPaddingTop(): string {
  //   switch (this.size()) {
  //     case 'small': return 'pt-3';
  //     case 'medium': return 'pt-4';
  //     case 'large': return 'pt-5';
  //     default: return 'pt-4';
  //   }
  // }

  // get paddingX(): string {
  //   return this.size() === 'small' ? 'px-3' : 'px-4';
  // }

  get labelLeft(): string {
    return this.size() === 'small' ? 'left-[12px]' : 'left-[15px]';
  }

  // get labelShownSize(): string {
  //   switch (this.size()) {
  //     case 'small': return 'text-[10px]';
  //     case 'medium': return 'text-[12px]';
  //     case 'large': return 'text-[14px]';
  //     default: return 'text-[12px]';
  //   }
  // }

  // get labelPlaceholderSize(): string {
  //   switch (this.size()) {
  //     case 'small': return 'text-[12px]';
  //     case 'medium': return 'text-[14px]';
  //     case 'large': return 'text-[16px]';
  //     default: return 'text-[14px]';
  //   }
  // }

  get errorBottom(): string {
    switch (this.size()) {
      case 'small':
        return 'bottom-[-14px]';
      case 'medium':
        return 'bottom-[-18px]';
      case 'large':
        return 'bottom-[-22px]';
      default:
        return 'bottom-[-18px]';
    }
  }

  get inputClasses(): string {
    return ''
    // return `border focus-within:border-[#008C79] border-[#ECECED] bg-white w-full placeholder:text-transparent ${this.inputTextSize} text-[#101010] font-medium rounded-[16px] ${this.inputHeight} outline-none ${this.inputPaddingTop} ${this.paddingX}`;
  }

  get labelClasses(): string {
    return ''
    // return `absolute ${this.labelLeft} text-[#A3A3A3] transition-all peer-placeholder-shown:font-medium peer-focus-within:font-normal peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:${this.labelPlaceholderSize} peer-focus-within:top-[6px] peer-focus-within:-translate-y-0 peer-focus-within:${this.labelShownSize} top-[6px] ${this.labelShownSize}`;
  }

  get errorClasses(): string {
    return `absolute ${this.errorBottom} ${this.labelLeft} text-[12px] text-red-500`;
  }

  // get controlInvalidAndTouched(): boolean {
  //   return !!(this.control()?.invalid && this.control()?.touched);
  // }


  open() {
    this.picker.open();
  }


  // ControlValueAccessor
  // writeValue(value: any): void {
  //   if (this.isRange && this.rangeForm) {
  //     this.rangeForm.setValue(value ?? { start: null, end: null }, { emitEvent: false });
  //   } else if (!this.isRange && this.singleControl) {
  //     this.singleControl.setValue(value ?? null, { emitEvent: false });
  //   }
  // }
  writeValue(value: any): void {
    if (this.isRange && this.rangeForm) {
      const rangeValue = value && typeof value === 'object'
        ? {start: value.start || null, end: value.end || null}
        : {start: null, end: null};
      this.rangeForm.setValue(rangeValue, {emitEvent: false});
      this.rangeStart.set(rangeValue.start);
      this.rangeEnd.set(rangeValue.end);
    } else if (!this.isRange && this.singleControl) {
      this.singleControl.setValue(value ?? null, {emitEvent: false});
    }
  }


  registerOnChange(fn: FunctionType): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: FunctionType): void {
    this.onTouched = fn;
  }

  // setDisabledState(state: boolean): void {
  //   this.disabled.set(state);
  //   if (this.isRange && this.rangeForm) {
  //     state ? this.rangeForm.disable({ emitEvent: false }) : this.rangeForm.enable({ emitEvent: false });
  //   } else if (!this.isRange && this.singleControl) {
  //     state ? this.singleControl.disable({ emitEvent: false }) : this.singleControl.enable({ emitEvent: false });
  //   }
  // }
  setDisabledState(state: boolean): void {
    this.disabled.set(state);
    if (this.isRange && this.rangeForm) {
      state ? this.rangeForm.disable({emitEvent: false}) : this.rangeForm.enable({emitEvent: false});
    } else if (!this.isRange && this.singleControl) {
      state ? this.singleControl.disable({emitEvent: false}) : this.singleControl.enable({emitEvent: false});
    }
  }

  hasError(): boolean {
    return this.validationService.hasError(this.control());
  }

  private listenValue(): void {
    toObservable(this.control, {injector: this.injector})
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

  onApply(): void {
    const start = this.rangeForm.get('start')?.value;
    const end = this.rangeForm.get('end')?.value ?? start;
    this.rangeForm.patchValue({end});
    this.rangeStart.set(start ?? null);
    this.rangeEnd.set(end ?? null);
    this.onChange(this.rangeForm.value);
  }


  // selectPreset(preset: 'today' | 'week' | 'month') {
  //   const now = new Date();
  //   let start: Date;
  //   let end: Date;
  //
  //   switch (preset) {
  //     case 'today':
  //       start = new Date(now);
  //       end = new Date(now);
  //       break;
  //
  //     case 'week':
  //       const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday ...
  //       start = new Date(now);
  //       start.setDate(now.getDate() - dayOfWeek + 1); // hafta boshini Monday qilib olamiz
  //       end = new Date(start);
  //       end.setDate(start.getDate() + 6);
  //       break;
  //
  //     case 'month':
  //       start = new Date(now.getFullYear(), now.getMonth(), 1);
  //       end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  //       break;
  //   }
  //   console.log(start, end);
  // }
}
