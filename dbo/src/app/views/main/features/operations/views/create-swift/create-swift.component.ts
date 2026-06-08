import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, ValidationErrors,
  Validators
} from '@angular/forms';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { UiSvgIconComponent } from '../../../../../../core/components/ui-svg-icon/ui-svg-icon.components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { OperationsService } from '../../services/operations.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, NavigationStart, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerInputEvent, MatDatepickerModule, } from '@angular/material/datepicker';
import { debounceTime } from 'rxjs';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { AccountsDto } from '../../../accounts-payments/models/accounts-payments.model';
import { SearchableComponent } from '../../../../../../core/components/searchable/searchable.component';
import { AdditionalInfoComponent } from '../../../../../../shared/components/additional-info/additional-info.component';
import { MatButton } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { ContainerNavComponent } from '../../../../../../shared/components/container-nav/container-nav.component';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import { AccountSelectComponent } from '../../../../../../shared/components/account-select/account-select.component';
import { UserService } from '../../../../../../core/services/user.service';
import { AccountService } from '../../../../../../core/services/account.service';
import { LocationBackDirective } from '../../../../../../shared/directives/location-back.directive';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { OperDayComponent } from '../../../new-payment/components/oper-day/oper-day.component';
import { WidgetsComponent } from '../../../../../../shared/components/widgets/widgets.component';
import { PaymentTitleComponent } from '../../../../../../shared/components/payment-title/payment-title.component';
import {
  AccountRequisitesComponent
} from '../../../../../../shared/components/account-requisites/account-requisites.component';
import {
  SwiftCorrespondentBankComponent
} from '../../../../../../shared/components/swift-correspondent-bank/swift-correspondent-bank.component';
import { BankComponent } from '../../../../../../shared/components/bank/bank.component';
import { ITab } from '../../../../../../shared/interfaces/tab.interface';
import { MoreActionsComponent } from '../../../new-payment/components/more-actions/more-actions.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  EspSignApplicationComponent
} from '../../../../../../core/components/esp-sign-application/esp-sign-application.component';
import { AlphaNumericSymbolMaskDirective } from '../../../../../../shared/directives/alpha-numeric-symbol.directive';
import { IDN } from '../../interfaces/idn.interface';
import {
  SearchableSelectComponent
} from '../../../../../../shared/components/searchable-select/searchable-select.component';
import { EspSignConfirmService } from '../../../../../../core/services/esp-confirm.service';
import { TemplateNameComponent } from '../../../template-transactions/components/template-name/template-name.component';
import { CustomDateAdapter } from '../../../../../../core/services/custom-date-adapter.service';


@Component({
    selector: 'app-create-conversion',
    imports: [
        NgIf,
        NgxMaskDirective,
        ReactiveFormsModule,
        NgClass,
        MatOption,
        MatSelect,
        UiSvgIconComponent,
        MatInputModule,
        MatDatepickerModule,
        MatAutocomplete,
        MatAutocompleteTrigger,
        SearchableComponent,
        AdditionalInfoComponent,
        MatButton,
        MatNativeDateModule,
        NgOptimizedImage,
        MatMenu,
        MatMenuTrigger,
        MatIcon,
        RouterLink,
        ContainerNavComponent,
        ContainerTitleComponent,
        AccountSelectComponent,
        LocationBackDirective,
        OperDayComponent,
        WidgetsComponent,
        PaymentTitleComponent,
        AccountRequisitesComponent,
        SwiftCorrespondentBankComponent,
        BankComponent,
        MoreActionsComponent,
        MatTooltip,
        MatSelectModule,
        AlphaNumericSymbolMaskDirective,
        SearchableSelectComponent,
        FormsModule,
    ],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
    ],
    templateUrl: './create-swift.component.html',
    styleUrls: ['./create-swift.component.scss'],
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CreateSwiftComponent implements OnInit {
  title = 'Заявление на перевод';
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Валютные операции',
      link: '/operations'
    },
    {
      title: this.title,
      link: '/'
    },
  ];

  templateModes = ['SWIFT'];

  docDate!: Date;
  info = 'Данное поле заполняется, если валюта платежа отличается от валюты получения';
  swiftLabel = 'SWIFT code';
  bic57Value = '';
  bic56Value = '';
  show56 = false;
  popCodeTemplate = '';

  private fb = inject(FormBuilder);
  private _utilsService = inject(UtilsService);
  private _operationsService = inject(OperationsService);
  private _cdRef = inject(ChangeDetectorRef);
  private _accountPaymentService = inject(AccountsPaymentsService);
  private accountService = inject(AccountService);
  private _userService = inject(UserService);
  private toastrService = inject(ToastrService);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private matDialog = inject(MatDialog);
  #destroy = inject(DestroyRef)

  constructor(
    private espConfirmService: EspSignConfirmService,
    private activatedRoute: ActivatedRoute,
    ) {

  }

  accounts!: AccountsDto[];

  currencies: any[] = [];

  tabs57: ITab[] = [
    {
      name: '57a.',
      value: '57a',
    },
    {
      name: '57d.',
      value: '57d',
    },
  ];

  bens = ['BEN', 'OUR', 'SHA'];

  specialCodes: string[] = [];
  idns: IDN[] = [];
  popCodes: any[] = [];
  speacialCodes: any[] = [];

  now = new Date();

  sender!: AccountsDto;
  receiverCurrency!: any;
  show36b = false;

  isEdit = false;
  isTemplate = false;
  templateId = '';

  preSelected!: AccountsDto;

  swiftForm = this.fb.group({
    docNum: [''],
    docDate:new FormControl <Date | null>(null, Validators.required),
    senderAccount: [''],
    senderAmount32: [''],
    senderCurrency32: [{value:'',disabled:true}],
    date32a: [new Date()],

    receiverAmount33: [''],
    receiverCurrency33: [''],

    currencyRate: [''],

    businessName50: [''],
    businessAddress50: [''],
    bankCode50: [''],

    correspondentBank56: [''],

    bankCorrespondent56Account: [''],
    bankCorrespondent56Name: [''],
    bankCorrespondent56Address: [''],

    bankBeneficiary57a: [''],

    bankBeneficiary57Account: [''],
    bankBeneficiary57Name: [''],
    bankBeneficiary57Address: [''],

    beneficiary59Account: [''],
    beneficiary59Name: [''],
    beneficiary59Address: [''],

    description70: [''],

    ben71: [''],
    currencyBen71: [''],

    codeAndDescription72: this.fb.array([
      this.fb.group({
        code: '',
        description: '',
      }),
    ]),

    narrative72: this.fb.array([
      this.fb.group({
        text: ['', [this.slashValidator]],
      }),
    ]),

    code77: [''],
  });

  focuses = [false, false, false, false, false, false];

  get codeControls() {
    return this.swiftForm.get('codeAndDescription72') as FormArray;
  }

  getTemplate() {
    this._operationsService.conversionTemplate
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((res) => {
        if(res) {
          this.updateFormTemplate(res);
        } else {
          if(this.isTemplate) {
            const data = sessionStorage.getItem('template-currency');
            if(data) {
              const obj = JSON.parse(data);
              obj.timeout = 2000;
              this.updateFormTemplate(obj);
            }
          }
        }
      })
  }

  updateFormTemplate(res: any) {
    const timeout = res.timeout;
    this.templateId = res.id;
    if(timeout) {
      setTimeout(() => {
        this.patchSwiftForm(res.additionalInfo);
        this.populateCodeAndDescription(res.additionalInfo);
        this.populateNarrative72(res.additionalInfo);
      }, timeout)
    } else {
      this.patchSwiftForm(res.additionalInfo);
      this.populateCodeAndDescription(res.additionalInfo);
      this.populateNarrative72(res.additionalInfo);
    }
  }

  patchSwiftForm(data: any) {
    this.check36b(data.currencycode_32a, data.currencycode_33b);

    this.getAccountsList(data.account_50k);

    if(data.bicorbei_56a?.length > 0 || data.account_56d?.length > 0) {
      this.show56 = true;
    }

    if(data.bicorbei_56a) {
      this.bic56Value = data.bicorbei_56a;
    } else {
      this.bic56Value = '';
    }

    if(data.bicorbei_57a) {
      this.bic57Value = data.bicorbei_57a;
    } else {
      this.bic57Value = '';
    }

    if(data.code77) {
      this.popCodeTemplate = data.code77;
      this.getPopCodes(data.code77);
    }

    let findCurr = ''
    this.receiverCurrency = data.currencycode_33b;
    if(this.receiverCurrency) {
      findCurr = this.currencies.find((curr) => curr.name === this.receiverCurrency);
    }

    this.swiftForm.patchValue({
      docDate: data.date_32a ? new Date(data.date_32a) : null,
      senderAmount32: `${+data.amount_32a/100}` || '',
      senderCurrency32: data.currencycode_32a || '',

      receiverAmount33: `${+data.amount_33b/100}` || '',
      receiverCurrency33: findCurr,

      correspondentBank56: data.nameandaddress_56d || '',
      bankCorrespondent56Account: data.account_56d || '',
      bankCorrespondent56Name: data.name_56d || '',
      bankCorrespondent56Address: data.address_56d || '',

      bankBeneficiary57a: data.bicorbei_57a || '',
      bankBeneficiary57Account: data.account_57d || '',
      bankBeneficiary57Name: data.name_57d || '',
      bankBeneficiary57Address: data.address_57d || '',

      currencyRate: `${data.rate_36 || ''}`,

      beneficiary59Account: data.account_59a || '',
      beneficiary59Name: data.name_59 || '',
      beneficiary59Address: data.address_59 || '',

      description70: data.narrative_70 || '',

      ben71: data.code_71a || '',
      currencyBen71: '',
    });

    this._cdRef.markForCheck();
  }

  get narrativeArr() {
    return this.swiftForm.get('narrative72') as FormArray;
  }

  addNarrative() {
    if (this.narrativeArr.length < 4) {
      this.narrativeArr.push(
        this.fb.group({
          text: ['', [this.slashValidator]], // Use a named key for clarity
        })
      );
    }
    this._cdRef.markForCheck();
  }

  removeNarrative(index: number) {
    if (this.narrativeArr.length > 1) {
      this.narrativeArr.removeAt(index);
    }
    this._cdRef.markForCheck();
  }

  slashValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && (!value.startsWith('/') || !value.endsWith('/'))) {
      return { slashError: true }; // Custom error key
    }
    return null;
  }

  checkSlashValidation(event: Event, index: number): void {
    const input = (event.target as HTMLInputElement).value.trim();
    const control = this.narrativeArr.at(index).get('text');

    if (control) {
      control.setValue(input);
      control.updateValueAndValidity();
    }
  }

  addFocus(index: number) {
    this.focuses[index] = true;
    this._cdRef.markForCheck();
  }

  removeFocus(index: number) {
    this.focuses[index] = false;
    this._cdRef.markForCheck();
  }

  addCodeAndDescription(index: number) {
    const control = this.swiftForm.get('codeAndDescription72') as FormArray;
    if(control.length > 5) {
      return;
    }

    control.insert(index + 1, this.fb.group({
      code: '',
      description: '',
    }));

    this._cdRef.markForCheck();
  }

  removeCodeAndDescription(index: number) {
    const control = this.swiftForm.get('codeAndDescription72') as FormArray;
    if(control.length < 1) {
      return;
    }

    if (control.length > 1) {
      control.removeAt(index);
    } else {
      alert('Cannot delete the last item!');
    }

    this._cdRef.markForCheck();
  }

  convertCodeAndDescription() {
    let obj: any = {};
    let index = 0;
    // @ts-ignore
    for(const value of Object.values(this.swiftForm.get('codeAndDescription72')?.value)) {
      const c = `code${index + 1}72`;
      const a = `additionalInfo${index + 1}72`;
      index++;
      obj = {
        ...obj,
        [c]: value.code,
        [a]: value.description
      }
    }

    return obj;
  }

  populateCodeAndDescription(data: any) {
    const codeAndDescriptionArray = this.fb.array<FormGroup>([]);

    let index = 1;
    while (data[`code${index}72`] || data[`additionalInfo${index}72`]) {
      codeAndDescriptionArray.push(
        this.fb.group({
          code: data[`code${index}72`] || '',
          description: data[`additionalInfo${index}72`] || '',
        })
      );
      index++;
    }

    this.swiftForm.setControl('codeAndDescription72', codeAndDescriptionArray);
  }

  populateNarrative72(data: any) {
    const narrativeArray = this.fb.array<FormGroup>([]);
    const arr = JSON.parse(data.narrative_72);
    for(let i=0; i< arr.length; i++) {
      narrativeArray.push(
        this.fb.group({
          text: [arr[i], [this.slashValidator]],
        })
      );
    }

    if(narrativeArray.length > 0) {
      this.swiftForm.setControl('narrative72', narrativeArray);
    }
  }

  show() {
  }

  getDocNum() {
    this.paymentService.getPaymentDocNum()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        if(val) {
          this.swiftForm.patchValue({
            docNum: val.msg
          })
          this._cdRef.markForCheck();
        }
      });
  }

  setDocDate(date:any) {
    let d: Date = date;
    if(typeof date === 'string') {
      d = new Date(date);
    }
    this.swiftForm.patchValue({
      docDate: d
    })
    this.docDate = date
  }

  selectedSenderAccount(value: any) {
    this.sender = value;
    this.receiverCurrency = value.balance.currency;
    const findCurr = this.currencies.find((curr) => curr.name === value.balance.currency);
    this.swiftForm.patchValue({
      senderAccount: value.altAcctId,
      senderCurrency32: value.balance.currency,
      receiverCurrency33: findCurr,
    });
    if(this.sender.balance.currency !== 'RUB') {
      this.swiftLabel = 'SWIFT code';
    } else {
      this.swiftLabel = 'BIC code';
    }
    this._cdRef.markForCheck();
    this.check36b(this.sender.balance.currency, this.receiverCurrency);
  }

  setReceiverAmount(event: any) {
    const value = this.swiftForm.getRawValue().senderAmount32;
    this.swiftForm.patchValue({
      receiverAmount33: value
    })
  }

  check36b(senderCurr: any, receiverCurr: any) {
    if(senderCurr && receiverCurr) {
      if(senderCurr !== receiverCurr) {
        this.show36b = true;
      } else {
        this.show36b = false;
      }
    }
  }

  setReceiverCurrency(curr: any) {
    this.receiverCurrency = curr.name;
    this.check36b(this.sender?.balance?.currency, this.receiverCurrency);
  }

  getCodes() {
    this._accountPaymentService.getSpecialCodes()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        this.specialCodes = val;
      })
  }

  getIdns() {
    this._operationsService.getIdns()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: val => {
          this.idns = val;
        }
      })
  }

  getSpecialCodes() {
    this._operationsService.getSpecialCodes()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: val => {
          this.speacialCodes = val;
          this._cdRef.detectChanges();
        }
      })
  }

  getPopCodes(event?: any) {
    this._operationsService.getPopCodes(event || '')
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: val => {
          this.popCodes = val;
          if(this.popCodeTemplate) {
            this.setPopCode()
          }
          this._cdRef.detectChanges();
        }
      })
  }

  setPopCode() {
    const popCode = this.popCodes.find((code) => code.code === this.popCodeTemplate);
    if(popCode) {
      this.swiftForm.patchValue({
        code77: popCode,
      });
    }
  }

  selectPopCode(popcode: any) {
  }

  displayOption(option: any) {
    if (option) {
      return `${option.code} - ${option.name}`;
    }
    return '';
  }


  getAccountMe() {
    this._userService.userInfo$$
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(user => {
        this.swiftForm.patchValue({
          businessName50: user?.businessName.toUpperCase(),
          businessAddress50: user?.address.toUpperCase(),
          bankCode50: user?.business.mfo.toUpperCase()
        });
        this._cdRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.watchRoute();
    this.getAccountsList();
    this.getCurrencies();
    this.getAccountMe();
    this.getDocNum();
    this.getCodes();
    this.getIdns();
    this.getSpecialCodes();
    this.getTemplate();
    this.watchLeave();
  }

  watchRoute() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((params) => {
        const from = params['from'];
        if(from === 'edit-template') {
          this.isEdit = true;
        } else if(from === 'swift-template') {
          this.isTemplate = true;
        }
      })
  }

  watchLeave() {
    this.router.events
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          sessionStorage.removeItem('template-currency');
        }
      })
  }

  selectAction(event: any) {
    if(event?.value === 'create') {
      this.createSwiftApplication();
    }
  }

  getSwiftBody(saved = false) {
    let body: any = this.swiftForm.getRawValue();
    body.senderAmount32 = (Number(+body?.senderAmount32) * 100);
    body.receiverAmount33 = (Number(+body?.receiverAmount33) * 100);
    body.receiverCurrency33 = body.receiverCurrency33.name;

    delete body.codeAndDescription72;

    body.narrative72 = Object.values(body.narrative72).map((el: any) => el.text);

    body = {
      ...body,
      ...this.convertCodeAndDescription(),
    }

    if(typeof body.code77 === 'object') {
      body.code77 = body.code77.code;
    }
    if(saved) {
      body.isSaved = true;
    }
    return body;
  }

  createSwiftApplication() {
    this.swiftForm.markAllAsTouched();
    if(this.swiftForm.valid) {
      this._utilsService.spinnerState$$.next(true);
      const body = this.getSwiftBody();
      this._operationsService.createSiwft(body)
        .pipe(takeUntilDestroyed(this.#destroy))
        .subscribe((res) => {
          if (!res) return;
          this.toastrService.success('Успешно');
          this.router.navigate(['/currency-transactions'])
        });
    }
  }

  send() {
    this.swiftForm.markAllAsTouched();
    if(this.swiftForm.valid) {
      this._utilsService.spinnerState$$.next(true);
      const body = this.getSwiftBody();
      this._operationsService.createSiwft(body)
        .pipe(takeUntilDestroyed(this.#destroy))
        .subscribe((res) => {
          if (!res) return;
          this.sign(res);
        });
    }
  }

  sign(transaction: any) {
    this._utilsService.spinnerState$$.next(true);
    this.espConfirmService.signApplication({
      transactionId: transaction.transactionId,
      applicationId: transaction.applicationId,
    }).pipe(takeUntilDestroyed(this.#destroy)).subscribe({
      next: (res: any) => {
        if(res) {
          this._utilsService.spinnerState$$.next(false);
          this.toastrService.success('Отправлен на подпись!');
          this.router.navigate(['/currency-transactions']);
          this._cdRef.detectChanges();
        }
      },
      error: (err: any) => {
        this._utilsService.spinnerState$$.next(false);
        this.toastrService.error(err?.message || err);
        this._cdRef.detectChanges();
      }
    })
  }

  createTemplateSwift() {
    this.swiftForm.markAllAsTouched();
    if(this.swiftForm.valid) {
      this.matDialog.open(TemplateNameComponent, {
        data: {
          title: 'Введите название шаблона',
        }
      }).afterClosed()
        .subscribe((name) => {
          if(name?.trim().length > 0) {
            this._utilsService.spinnerState$$.next(true);
            const body = this.getSwiftBody(true);
            this._operationsService.createSiwft({
              ...body,
              name,
              isSaved: true,
            })
              .pipe(takeUntilDestroyed(this.#destroy))
              .subscribe((res) => {
                if (!res) return;
                this.toastrService.success('Успешно');
                this.router.navigate(['/templates'])
              });
          }
        });
    }
  }

  editTemplateSwift() {
    this.swiftForm.markAllAsTouched();
    if(this.swiftForm.valid) {
      this.matDialog.open(TemplateNameComponent, {
        data: {
          title: 'Введите название шаблона',
        }
      }).afterClosed()
        .subscribe((name) => {
          if(name?.trim().length > 0) {
            this._accountPaymentService.deleteSavedPayment(this.templateId)
              .pipe(takeUntilDestroyed(this.#destroy))
              .subscribe({
                next: (res) => {
                  if(res) {
                    this._utilsService.spinnerState$$.next(true);
                    const body = this.getSwiftBody(true);
                    this._operationsService.createSiwft({
                      ...body,
                      name,
                      isSaved: true,
                    })
                      .pipe(takeUntilDestroyed(this.#destroy))
                      .subscribe((res) => {
                        if (!res) return;
                        this.toastrService.success('Успешно');
                        this.router.navigate(['/templates'])
                      });
                  }
                },
                error: (err) => {
                  this.toastrService.error(err.message || err || 'Что то пошло не так...');
                }
              })
          }
        });
    }
  }

  getCurrencies() {
    this._accountPaymentService.getCurrencies()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res) => {
          if(res) {
            this.currencies = res;
            this._cdRef.markForCheck();
          }
        }
      })
  }

  getAccountsList(account?: string) {
    this.accountService.getPaymentAllowed(
      {page: 0, size: 100},
      {
        senderAccount: null,
        transactionMode: 'SWIFT'
      })
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(res => {
      if (!res) return;
      this.accounts = res.content;
      if(account) {
        const acc = this.accounts.find(a => a.altAcctId === account);
        if(acc) {
          this.preSelected = acc;
        }
      }
    })
  }
}
