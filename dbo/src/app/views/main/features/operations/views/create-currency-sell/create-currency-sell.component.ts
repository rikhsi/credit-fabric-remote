import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { UiSvgIconComponent } from '../../../../../../core/components/ui-svg-icon/ui-svg-icon.components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { OperationsService } from '../../services/operations.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule, } from '@angular/material/datepicker';
import { debounceTime, take } from 'rxjs';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { AccountsDto } from '../../../accounts-payments/models/accounts-payments.model';
import { SearchableComponent } from '../../../../../../core/components/searchable/searchable.component';
import { AdditionalInfoComponent } from '../../../../../../shared/components/additional-info/additional-info.component';
import { MatButton } from '@angular/material/button';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { ContainerNavComponent } from '../../../../../../shared/components/container-nav/container-nav.component';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import { AccountSelectComponent } from '../../../../../../shared/components/account-select/account-select.component';
import { SelectComponent } from '../../../../../../shared/components/select/select.component';
import { RequestConversionReqNewDto } from '../../models/conversion.model';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import { AccountComponent } from '../../../../../../shared/components/account/account.component';
import {
  AccountRequisitesComponent
} from '../../../../../../shared/components/account-requisites/account-requisites.component';
import { BankComponent } from '../../../../../../shared/components/bank/bank.component';
import { MoreActionsComponent } from '../../../new-payment/components/more-actions/more-actions.component';
import {
  SwiftCorrespondentBankComponent
} from '../../../../../../shared/components/swift-correspondent-bank/swift-correspondent-bank.component';
import { WidgetsComponent } from '../../../../../../shared/components/widgets/widgets.component';
import { AccountService } from '../../../../../../core/services/account.service';
import { UserService } from '../../../../../../core/services/user.service';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { MatDialog } from '@angular/material/dialog';
import { ITab } from '../../../../../../shared/interfaces/tab.interface';
import { MatTooltip } from '@angular/material/tooltip';
import { EspSignConfirmService } from '../../../../../../core/services/esp-confirm.service';
import { TemplateNameComponent } from '../../../template-transactions/components/template-name/template-name.component';
import { LocationBackDirective } from '../../../../../../shared/directives/location-back.directive';
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
        SelectComponent,
        MatAccordion,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        AccountComponent,
        AccountRequisitesComponent,
        BankComponent,
        MoreActionsComponent,
        SwiftCorrespondentBankComponent,
        WidgetsComponent,
        MatTooltip,
        NgForOf,
        LocationBackDirective,
    ],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
    ],
    templateUrl: './create-currency-sell.component.html',
    styleUrls: ['./create-currency-sell.component.scss'],
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CreateCurrencySellComponent implements OnInit {
  title = 'Заявка на продажу иностранной валюты';
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
  templateModes = ['CONVERSION_SELL'];

  idns: any[] = [];

  isEdit = false;
  isTemplate = false;
  templateId = '';

  docDate = '';
  info = 'Данное поле заполняется, если валюта платежа отличается от валюты получения';

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
  #destroy = inject(DestroyRef);

  now = new Date();
  tomorrow = new Date();


  constructor(
    private espConfirmService: EspSignConfirmService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.tomorrow.setDate(this.now.getDate() + 1);
  }

  accounts!: AccountsDto[];
  preSelectedSender!: AccountsDto;
  preSelectedReceiver!: AccountsDto;
  receiverAccounts!: AccountsDto[];

  currencies: any[] = [];
  currency = '';

  terms = [
    {
      title: 'Поступления от экспорта',
      value: '001',
    },
    {
      title: 'Кредиты, полученные от отечественного банка',
      value: '002',
    },
    {
      title: 'Кредиты, поступившие из-за границы',
      value: '003',
    },
    {
      title: 'Обратная продажа неисподьзованной валюты',
      value: '004',
    },
    {
      title: 'Другие источники',
      value: '005',
    },
  ]

  swiftForm = this.fb.group({
    mode: ['CONVERSION_SELL'],
    docNum: [''],
    docDate: new FormControl<any>(null),
    senderAccount: [''],
    receiverAccount: [''],
    currencyAmount: [''],
    sourceBuyCode: [''],
    paymentStructure: ['1'],
    currency: [null],
    aimCode: [''],

    clientCurrencyOfferRate: [''],
    clientCurrencyOfferAmount: [''],

    detail: [''],
  });

  setSender(acc: AccountsDto) {
    this.swiftForm.patchValue({
      senderAccount: acc.altAcctId
    });
    this.getReceiverAccountList()
  }

  getCurrencyOffer() {
    const senderAmount = this.swiftForm.value.currencyAmount;
    const senderAccount = this.swiftForm.value.senderAccount;
    const receiverAccount = this.swiftForm.value.receiverAccount;
    if (senderAmount && senderAccount && receiverAccount) {
      this._operationsService.getOfferAmount({
        senderAmount: +senderAmount * 100,
        senderAccount,
        receiverAccount,
      })
        .pipe(takeUntilDestroyed(this.#destroy))
        .pipe(debounceTime(300))
        .subscribe(val => {
          const rate = val.rate as any;
          const amount = `${rate.amount/Math.pow(10, rate.scale || 0)}`;
          const senderAmount = `${val.amount.amount/Math.pow(10, val.amount.scale)}`;

          this.swiftForm.patchValue({
            clientCurrencyOfferAmount: senderAmount,
            clientCurrencyOfferRate: amount,
          })
          this._cdRef.detectChanges()
        })
    }
  }

  selectCurrency(curr: any) {
    this.currency = curr.name;
    this.getAccountsList();
  }

  updateOffer() {
    this.swiftForm.get('currencyAmount')?.valueChanges
      .pipe(
        debounceTime(800),
        takeUntilDestroyed(this.#destroy)
      )
      .subscribe(() => this.getCurrencyOffer());
    this.swiftForm.get('senderAccount')?.valueChanges
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.#destroy)
      )
      .subscribe(() => this.getCurrencyOffer());

    this.swiftForm.get('receiverAccount')?.valueChanges
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.#destroy)
      )
      .subscribe(() => this.getCurrencyOffer());
  }

  setReceiver(acc: AccountsDto) {
    this.swiftForm.patchValue({
      receiverAccount: acc.altAcctId
    })
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

  setDocDate(date: any) {
    let d: Date = date;
    if(typeof date === 'string') {
      d = new Date(date);
    }
    this.swiftForm.patchValue({
      docDate: d,
    });
    if(d.getTime() > this.tomorrow.getTime()) {
      this.tomorrow = d;
    }
    this.docDate = date;
  }

  getAccountMe() {
    this._userService.userInfo$$
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(user => {
        this.swiftForm.patchValue({
        });
      });
  }

  ngOnInit(): void {
    this.watchRoute();
    this.getAccountsList();
    this.getCurrencies();
    this.getAccountMe();
    this.getDocNum();
    this.updateOffer();
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
        } else if(from === 'sell-template') {
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
    if(event.value === 'create') {
      this.onSubmit();
    }
  }

  logInvalidControls(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control && control.invalid) {
      }
    });
  }

  getTemplate() {
    this._operationsService.conversionTemplate
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((res) => {
        if(res) {
          const timeout = res.timeout;
          if(timeout) {
            setTimeout(() => {
              this.updateFormTemplate(res);
            }, timeout);
          } else {
            this.updateFormTemplate(res);
          }
        } else {
          if(this.isTemplate) {
            const data = sessionStorage.getItem('template-currency');
            if(data) {
              const obj = JSON.parse(data);
              setTimeout(() => {
                this.updateFormTemplate(obj);
              }, 2000);
            }
          }
        }
      })
  }

  updateFormTemplate(res: any) {
    this.templateId = res.id;
    this.preSelectSender(res.sender.account);
    this.getReceiverAccountList(res.recipient.account);

    this.setCurrency(res.senderAmount.currency);

    this.swiftForm.patchValue({
      ...res.additionalInfo,
      detail: res.description,
      aimName: res.purpose.name,
      aimCode: res.purpose.code,
      receiverAccount: res.recipient.account,
      senderAccount: res.sender.account,
      termsPayment: +res.additionalInfo.termsPayment,
      sourceBuyCode: +res.additionalInfo.sourceBuyCode,
      currencyAmount: +res.senderAmount.amount/100,
    });
  }

  setCurrency(curr: string) {
    const currency = this.currencies.find(c => c.name === curr);
    if(currency) {
      this.swiftForm.patchValue({
        currency
      })
    }
  }

  preSelectSender(account: string) {
    const acc = this.accounts.find((el: any) => el.altAcctId === account);

    if(acc) {
      this.preSelectedSender = acc;
    }
  }

  getBody() {
    const body = this.swiftForm.getRawValue() as any;
    body.currencyAmount = (Number(+body?.currencyAmount) * 100) as number;
    body.paymentStructure = +body.paymentStructure;
    body.docDate = this.swiftForm.value.docDate;
    delete body.clientCurrencyOfferRate;
    delete body.clientCurrencyOfferAmount;
    delete body.currency;

    return body;
  }

  onSubmit(type = 'DEFAULT') {
    this.logInvalidControls(this.swiftForm)
    if (this.swiftForm.valid) {
      const body = this.getBody();

      if(type === 'TEMPLATE') {
        this.createTemplateCurrencySell(body);
      } else if(type === 'SUBMIT') {
        this.send(body)
      } else if(type === 'edit-template') {
        this.editTemplateCurrencySell(body);
      } else {
        this.createCurrencySell(body);
      }


    }
  }

  createCurrencySell(body: any) {
    this._operationsService.createConversion(body)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next:(res) => {
          if (!res) return;
          this.toastrService.success('Успешно');
          this.router.navigate(['/currency-sell']);
          this._utilsService.spinnerState$$.next(false);
        },
        error: (err: any) => {
          this.toastrService.error(err?.message || err);
          this._utilsService.spinnerState$$.next(false);
        }
      });
  }

  createTemplateCurrencySell(body: any) {
    this.matDialog.open(TemplateNameComponent, {
      data: {
        title: 'Введите название шаблона',
      }
    }).afterClosed()
      .subscribe( (name: string) => {
      if(name.length > 0) {
        this._utilsService.spinnerState$$.next(true);
        this._operationsService.createConversion({
          ...body,
          name,
          isSaved: true,
        })
          .pipe(takeUntilDestroyed(this.#destroy))
          .subscribe({
            next: (res) => {
              if (!res) return;
              this.toastrService.success('Успешно!');
              this.router.navigate(['/templates']);
              this._utilsService.spinnerState$$.next(false);
            },
            error: (err: any) => {
              this.toastrService.error(err?.message || err);
              this._utilsService.spinnerState$$.next(false);
            }
          });
      }
    });
  }

  editTemplateCurrencySell(body: any) {
    this.matDialog.open(TemplateNameComponent, {
      data: {
        title: 'Введите название шаблона',
      }
    }).afterClosed()
      .subscribe( (name: string) => {
        if(name.length > 0) {
          this._accountPaymentService.deleteSavedPayment(this.templateId)
            .pipe(takeUntilDestroyed(this.#destroy))
            .subscribe({
              next: (res) => {
                if(res) {
                  this._utilsService.spinnerState$$.next(true);
                  this._operationsService.createConversion({
                    ...body,
                    name,
                    isSaved: true,
                  })
                    .pipe(takeUntilDestroyed(this.#destroy))
                    .subscribe({
                      next: (res) => {
                        if (!res) return;
                        this.toastrService.success('Успешно!');
                        this.router.navigate(['/templates']);
                        this._utilsService.spinnerState$$.next(false);
                      },
                      error: (err: any) => {
                        this.toastrService.error(err?.message || err);
                        this._utilsService.spinnerState$$.next(false);
                      }
                    });
                }
              },
              error: (err) => {
                this._utilsService.spinnerState$$.next(false);
                this.toastrService.error(err.message || err || 'Что-то пошло не так...');
              }
            })
        }
      });
  }

  send(body: any) {
    this._utilsService.spinnerState$$.next(true);
    this._operationsService.createSiwft(body)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((res) => {
        if (!res) return;
        this.sign(res);
      });
  }

  sign(transaction: any) {
    this._utilsService.spinnerState$$.next(true);
    this.espConfirmService.signApplication({
      transactionId: transaction.conversionApplicationDto.transactionId,
      applicationId: transaction.applicationId,
    }).pipe(takeUntilDestroyed(this.#destroy)).subscribe({
      next: (res: any) => {
        if(res) {
          this._utilsService.spinnerState$$.next(false);
          this.toastrService.success('Отправлен на подпись!');
          this.router.navigate(['/currency-sell']);
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

  getAccountsList() {
    this._accountPaymentService.getPaymentAllowed(
      {page: 0, size: 100},
      {
        senderAccount: null,
        transactionMode: 'CONVERSION_SELL',
        currency: this.currency,
      })
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(res => {
        if (!res) return;
        this.accounts = res.content;
        this._cdRef.markForCheck();
      })
  }

  getReceiverAccountList(account?: string) {
    this.accountService.getPaymentAllowed(
      {page: 0, size: 100},
      {
        senderAccount: this.swiftForm.getRawValue().senderAccount,
        transactionMode: 'CONVERSION_SELL'
      })
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(res => {
        if (!res) return;
        this.receiverAccounts = res.content;
        if(account) {
          const acc = res.content.find(el => el.altAcctId === account);
          if(acc) {
            this.preSelectedReceiver = acc;
          }
        }
        this._cdRef.markForCheck();
      })
  }
}
