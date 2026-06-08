import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatOption } from '@angular/material/autocomplete';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelect } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';
import {
  AbstractControl, FormArray, FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors, ValidatorFn,
  Validators
} from '@angular/forms';
import { UiSvgIconComponent } from '../../../../../../core/components/ui-svg-icon/ui-svg-icon.components';
import { JsonPipe, NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { AccountsPaymentsService } from '../../services/accounts-payments.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { LocationBackDirective } from '../../../../../../shared/directives/location-back.directive';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { UserService } from '../../../../../../core/services/user.service';
import { ContainerNavComponent } from '../../../../../../shared/components/container-nav/container-nav.component';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { AlphaNumericSymbolMaskDirective } from '../../../../../../shared/directives/alpha-numeric-symbol.directive';
import { AuthService } from '../../../../../auth/services/auth.service';
import { CustomDateAdapter } from '../../../../../../core/services/custom-date-adapter.service';

@Component({
    selector: 'app-create-account',
    imports: [
        MatFormField,
        MatOption,
        MatRadioButton,
        MatRadioGroup,
        MatSelect,
        NgxMaskDirective,
        ReactiveFormsModule,
        UiSvgIconComponent,
        NgClass,
        NgIf,
        JsonPipe,
        LocationBackDirective,
        MatIcon,
        MatInput,
        MatFormFieldModule,
        ContainerNavComponent,
        ContainerTitleComponent,
        MatDatepickerToggle,
        MatDatepicker,
        MatDatepickerInput,
        NgOptimizedImage,
        AlphaNumericSymbolMaskDirective,
    ],
    templateUrl: './create-account.component.html',
    styles: ``,
    providers: [
        provideNativeDateAdapter(),
        { provide: DateAdapter, useClass: CustomDateAdapter },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CreateAccountComponent implements OnInit {
  title = 'Открытие счета'
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Счета и платежи ',
      link: '/accounts-and-payments'
    },
    {
      title: this.title,
      link: '/'
    },
  ];
  validateEmail = "[a-zA-Z0-9._\-]+[@]+[a-zA-Z0-9\-]+[.]+[a-zA-Z]{2,6}";
  directorFileName: string | null = null;
  financeFileName: string | null = null;
  #destroy = inject(DestroyRef)

  constructor(
    private _utilsService: UtilsService,
    private userService: UserService,
    private _toast: ToastrService,
    private _router: Router,
    private _cf: ChangeDetectorRef,
    private _accountPaymentsService: AccountsPaymentsService,
    private authService: AuthService,
    private fb: FormBuilder,
  ) {
  }

  createAccountForm: FormGroup = new FormGroup({
    inn: new FormControl('', [Validators.required, Validators.maxLength(9), Validators.minLength(9)]),
    businessName: new FormControl('', Validators.required),
    codeFilial: new FormControl('01095', [Validators.required, Validators.maxLength(5), Validators.minLength(5)]),
    accountTypeAndCurrency: this.fb.array([
      this.fb.group({
        type: ['', Validators.required],
        currency: ['', Validators.required],
      })
    ]),

    director: new FormGroup({
      name: new FormControl('', Validators.required),
      pinfl: new FormControl('', [Validators.required, Validators.maxLength(14), Validators.minLength(14)]),
      passport: new FormControl('', [Validators.required, this.passportFormatValidator()]),
      issuedDate: new FormControl(null, Validators.required),
      issuedBy: new FormControl('', Validators.required),
      email: new FormControl('', Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)),
      phone: new FormControl('', Validators.required),
      username: new FormControl(''),
    }),

    headOfFinance: new FormGroup({
      name: new FormControl('', Validators.required),
      pinfl: new FormControl('', [Validators.required, Validators.maxLength(14), Validators.minLength(14)]),
      passport: new FormControl('', [Validators.required, this.passportFormatValidator()]),
      issuedDate: new FormControl(null, Validators.required),
      issuedBy: new FormControl('', Validators.required),
      email: new FormControl('', Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)),
      phone: new FormControl('', Validators.required),
      username: new FormControl(''),
    }),

  });
  accountTypes: any[] = [];
  currencies: any[] = [];

  ngOnInit() {
    this.getUserInfo();
    this.getCuurencies();
    this.getAccountTypes();
    this.getDirectorInfo();
    this.getHeadFinanceInfo();
  }

  getUserInfo() {
    this.userService.userInfo$$
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((res) => {
        this.createAccountForm.patchValue({
          businessName: res?.business?.name,
          inn: res?.business?.inn,
        })
      });
  }

  getCuurencies() {
    this._accountPaymentsService.getCurrencies()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        this.currencies = val.filter((v: any) => v !== 'UNKNOWN');
      })
  }

  getAccountTypes() {
    this._accountPaymentsService.getAccountTypes()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        this.accountTypes = val;
      })
  }

  addAccountTypeAndCurrency() {
    const accountTypeAndCurrencyArray = this.createAccountForm.get('accountTypeAndCurrency') as FormArray;
    accountTypeAndCurrencyArray.push(
      new FormGroup({
        type: new FormControl('', Validators.required),
        currency: new FormControl('', Validators.required),
      })
    );
  }

  removeAccountTypeAndCurrency(index: number) {
    const accountTypeAndCurrencyArray = this.createAccountForm.get('accountTypeAndCurrency') as FormArray;
    accountTypeAndCurrencyArray.removeAt(index);
  }

  convertToMap(data: any): Map<string, string> {
    let obj: any = {};
    for(let i=0; i<data.length; i++) {
      const item = data[i];
      obj[item.type] = item.currency;
    }
    return obj;
  };

  get getAccountTypeAndCurrencyControls(): FormArray {
    return this.createAccountForm.get('accountTypeAndCurrency') as FormArray;
  }

  onFileSelected(event: Event, type: 'director' | 'finance'): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileName = file.name;

      if (type === 'director') {
        this.directorFileName = fileName;
      } else if (type === 'finance') {
        this.financeFileName = fileName;
      }
      this._utilsService.spinnerState$$.next(true)
      this._accountPaymentsService.fileUpload(file).pipe(takeUntilDestroyed(this.#destroy)).subscribe({
        next: (response) => {
          const attachmentId = response?.attachmentId;
          if (type === 'director') {
            this.createAccountForm.patchValue({ directorDocument: attachmentId })
            this._cf.detectChanges()
          } else if (type === 'finance') {
            this.createAccountForm.patchValue({ headOfFinanceDocument: attachmentId })
            this._cf.detectChanges()
          }

        },
        error: (err) => {
          if (type === 'director') {
            this.directorFileName = null;
          } else if (type === 'finance') {
            this.financeFileName = null;
          }
        },
        complete:()=>{
          this._cf.detectChanges()
        }
      });
    } else {
      if (type === 'director') {
        this.directorFileName = null;
      } else if (type === 'finance') {
        this.financeFileName = null;
      }
    }
  }

  getDirectorInfo() {
    this.authService.getUserByRole(['DIRECTOR'])
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(res => {
        if(res) {
          if(!res.content.length) return;
          const director = res.content[0];
          if(!res) return;
          this.createAccountForm.patchValue({
            director: {
              passport: director.asSerialNumber,
              name: `${director.lastName} ${director.firstName}`,
              pinfl: director.pnfl,
              phone: director.phoneNumber.slice(3),
              email: director.email,
              username: director.username,
            }
          });
          this._cf.markForCheck();
        }
      });
  }

  getHeadFinanceInfo() {
    this.authService.getUserByRole(['HEAD_OF_FINANCE'])
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(res => {
        if(!res.content.length) return;
        const headOfFinance = res.content[0];
        if(!res) return;
        this.createAccountForm.patchValue({
          headOfFinance: {
            passport: headOfFinance.asSerialNumber,
            name: `${headOfFinance.lastName} ${headOfFinance.firstName}`,
            pinfl: headOfFinance.pnfl,
            phone: headOfFinance.phoneNumber.slice(3),
            email: headOfFinance.email,
            username: headOfFinance.username,
          }
        })
      });
  }

  formSubmit() {
    this.createAccountForm.markAllAsTouched();
    if (this.createAccountForm.valid) {
      const body = this.createAccountForm.getRawValue();
      const directorPhone = this.replaceSpaces(body.director.phone);
      const headOfFinancePhone = this.replaceSpaces(body.headOfFinance.phone);
      body.director.phone = directorPhone;
      body.headOfFinance.phone = headOfFinancePhone;
      body.accountTypeAndCurrency = this.convertToMap(body.accountTypeAndCurrency);
      this._utilsService.spinnerState$$.next(true);
      this._accountPaymentsService.createAccount(body)
        .pipe(takeUntilDestroyed(this.#destroy))
        .subscribe((res) => {
          if (!res) return
          this._toast.success(res.msg)
          this._router.navigate(['/accounts-and-payments'], {
            queryParams: {
              tab: 'accounts'
            }
          }).then(() => {})
          this._cf.detectChanges()
        })
    }
  }

  replaceSpaces(value: string) {
    return value.replaceAll(' ', '')
  }

  passportFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const formatPattern = /^[A-Z]{2}\d{7}$/;

      if (!formatPattern.test(value)) {
        return { invalidPassportFormat: true };
      }

      return null;
    };
  }
}
