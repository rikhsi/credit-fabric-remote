import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';
import { ContainerNavComponent } from '../../../../shared/components/container-nav/container-nav.component';
import { ContainerTitleComponent } from '../../../../shared/components/container-title/container-title.component';
import { WidgetsComponent } from '../../../../shared/components/widgets/widgets.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
  MatDatepickerToggleIcon
} from '@angular/material/datepicker';
import { UiSvgIconComponent } from '../../../../core/components/ui-svg-icon/ui-svg-icon.components';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaymentService } from '../../../../core/services/payment.service';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoPayForm } from './interfaces/auto-pay.interface';
import { autoPayPeriod } from './constans/auto-pay';
import { ActivatedRoute } from '@angular/router';
import { CustomDateAdapter } from '../../../../core/services/custom-date-adapter.service';

@Component({
    selector: 'app-create-autopay',
    imports: [
        ContainerNavComponent,
        ContainerTitleComponent,
        WidgetsComponent,
        MatFormFieldModule,
        MatInput,
        MatSelect,
        MatIcon,
        NgOptimizedImage,
        MatCheckbox,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        MatDatepickerToggleIcon,
        UiSvgIconComponent,
        MatOption,
        ReactiveFormsModule,
        NgClass,
    ],
    providers: [
        provideNativeDateAdapter(),
        { provide: DateAdapter, useClass: CustomDateAdapter },
    ],
    templateUrl: './create-autopay.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateAutopayComponent implements OnInit {
  title = 'Автоплатежи';
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Шаблоны и автоплатежи',
      link: '/templates',
      tab:'AUTO_PAYMENTS',
    },
    {
      title: this.title,
      link: '/'
    },
  ];

  templateModes = ['SWIFT'];
  docDate!: Date;

  formTemplate: any;
  autoPayPeriod = autoPayPeriod;

  times = Array.from({ length: 24 }, (_, index) => ({
    value: `${index.toString().padStart(2, '0')}:00`,
    title: `${index.toString().padStart(2, '0')}:00`,
  }));

  @Output() autoPay = new EventEmitter<AutoPayForm>();

  monthsData = [
    { value: 1, label: 'Янв' },
    { value: 2, label: 'Фев' },
    { value: 3, label: 'Март' },
    { value: 4, label: 'Апр' },
    { value: 5, label: 'Май' },
    { value: 6, label: 'Июнь' },
    { value: 7, label: 'Июль' },
    { value: 8, label: 'Авг' },
    { value: 9, label: 'Сен' },
    { value: 10, label: 'Окт' },
    { value: 11, label: 'Ноя' },
    { value: 12, label: 'Дек' }
  ];

  weeksData = [
    { value: 1, label: 'Пн' },
    { value: 2, label: 'Вт' },
    { value: 3, label: 'Ср' },
    { value: 4, label: 'Чт' },
    { value: 5, label: 'Пт' },
    { value: 6, label: 'Сб' },
    { value: 7, label: 'Вс' },
  ];

  notificationTimes = [
    {
      title: 'За 5 минут до отправки',
      value: 'FIVE_MINUTE',
    },
    {
      title: 'За час до отправки',
      value: 'AN_HOUR',
    },
    {
      title: 'За день до отправки',
      value: 'A_DAY',
    },
  ];

  autoPayForm = this.fb.group({
    name: ['', Validators.required],
    paymentFrequency: [this.autoPayPeriod[0].value, Validators.required],
    months: this.fb.array([
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      ]),
    days: this.fb.array([
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
      this.fb.control(true),
    ]),
    paymentDay: [1, Validators.required],
    paymentTime: ['12', Validators.required],
    dateEnd: ['', Validators.required],
    withNotification: [false],
    notificationBeforeTime: [this.notificationTimes[0].value],
  });

  constructor(
    private _cdRef: ChangeDetectorRef,
    private destroyRef: DestroyRef,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.watchForm();
    this.watchRoute();
  }

  watchForm() {
    this.autoPayForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        let emitData: any = res;
        emitData.months = this.replaceTrueWithIndexes(res.months as boolean[]);
        emitData.days = this.replaceTrueWithIndexes(res.days as boolean[]);

        if(emitData.paymentFrequency === 'MONTHLY') {
          emitData.days = [];
        } else {
          emitData.months = [];
        }


        if(this.formTemplate) {
          emitData.id = this.formTemplate.id;
        }

        this.autoPay.emit(emitData as unknown as AutoPayForm);
      })
  }

  watchRoute() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const from = params['from'];
        if(from === 'template-payment') {
          this.getAutoPayForm();
        }
      })
  }

  fillBooleanArray(sourceArray: {}[], numbersArray: number[], type = 'months') {
    const controls = this.autoPayForm.get(type) as FormArray;

    sourceArray.forEach((month, index) => {
      if(numbersArray.includes(index+1)) {
        controls.push(this.fb.control(true));
      } else {
        controls.push(this.fb.control(false));
      }
    });
    this._cdRef.detectChanges();
  }

  getAutoPayForm() {
    const autoPayTemp = sessionStorage.getItem('auto-payment');
    if(autoPayTemp) {
      this.formTemplate = JSON.parse(autoPayTemp);

      this.fillForm(this.formTemplate);
    }
  }

  fillForm(form: AutoPayForm) {
    const template = sessionStorage.getItem('template-payment');
    let name = '';
    if(template) {
      const templateForm = JSON.parse(template);
      name = templateForm.name;
    }

    const {days, months, ...rest} = form;

    this.autoPayForm.patchValue({
      ...rest,
      name,
    });

    if(form.paymentFrequency === 'MONTHLY') {
      this.fillBooleanArray(this.monthsData, form.months, 'months');
    } else {
      this.fillBooleanArray(this.weeksData, form.days, 'days');
    }
    this._cdRef.markForCheck();
  }

  replaceTrueWithIndexes(input: boolean[]): number[] {
    return input
      .map((value, index) => (value ? index + 1 : null))
      .filter((value): value is number => value !== null);
  }
}
