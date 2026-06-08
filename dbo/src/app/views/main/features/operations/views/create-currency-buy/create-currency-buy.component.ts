import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { NgClass, NgForOf, NgIf, NgOptimizedImage, NgStyle } from '@angular/common';
import {NgxMaskDirective} from 'ngx-mask';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatSelect} from '@angular/material/select';
import {UiSvgIconComponent} from '../../../../../../core/components/ui-svg-icon/ui-svg-icon.components';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {UtilsService} from '../../../../../../core/services/utils.service';
import {OperationsService} from '../../services/operations.service';
import {ToastrService} from 'ngx-toastr';
import { ActivatedRoute, NavigationStart, Router, RouterLink } from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule,} from '@angular/material/datepicker';
import {debounceTime, take} from 'rxjs';
import {AccountsPaymentsService} from '../../../accounts-payments/services/accounts-payments.service';
import {AccountsDto} from '../../../accounts-payments/models/accounts-payments.model';
import {SearchableComponent} from '../../../../../../core/components/searchable/searchable.component';
import {AdditionalInfoComponent} from '../../../../../../shared/components/additional-info/additional-info.component';
import {MatButton} from '@angular/material/button';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';
import {ContainerNavComponent} from '../../../../../../shared/components/container-nav/container-nav.component';
import {ContainerTitleComponent} from '../../../../../../shared/components/container-title/container-title.component';
import {AccountSelectComponent} from '../../../../../../shared/components/account-select/account-select.component';
import {SelectComponent} from '../../../../../../shared/components/select/select.component';
import {RequestConversionReqNewDto} from '../../models/conversion.model';
import {MatAccordion, MatExpansionPanel} from '@angular/material/expansion';
import {WidgetsComponent} from "../../../../../../shared/components/widgets/widgets.component";
import { IDN } from '../../interfaces/idn.interface';
import { MoreActionsComponent } from '../../../new-payment/components/more-actions/more-actions.component';
import {
  SearchableSelectComponent
} from '../../../../../../shared/components/searchable-select/searchable-select.component';
import { MatError } from '@angular/material/form-field';
import { EspSignConfirmService } from '../../../../../../core/services/esp-confirm.service';
import { MatDialog } from '@angular/material/dialog';
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
        NgForOf,
        WidgetsComponent,
        MoreActionsComponent,
        SearchableSelectComponent,
        NgStyle,
        MatError,
        LocationBackDirective,
    ],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
    ],
    templateUrl: './create-currency-buy.component.html',
    styleUrls: ['./create-currency-buy.component.scss'],
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CreateCurrencyBuyComponent implements OnInit {
  title = 'Заявка на покупку иностранной валюты';
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
  file!: File | undefined;
  templateModes = ['CONVERSION_BUY'];
  private fb = inject(FormBuilder);
  private _utilsService = inject(UtilsService);
  private _operationsService = inject(OperationsService);
  private _cdRef = inject(ChangeDetectorRef);
  private _accountPaymentService = inject(AccountsPaymentsService);
  private toastrService = inject(ToastrService);
  private router = inject(Router);
  #destroy = inject(DestroyRef);

  constructor(
    private espConfirmService: EspSignConfirmService,
    private matDialog: MatDialog,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  inputClasses = 'rounded-12px border-1px border-secondary w-full h-11 px-2 outline-none';
  accounts!: AccountsDto[];

  currencies: any[] = [];

  termsPayments = [
    {
      name: 'По факту',
      value: 1,
    },
    {
      name:'Предоплата',
      value: 2,
    },
    {
      name: 'Аккредитив',
      value: 3,
    },
    {
      name: 'Прочие',
      value: 4,
    },
  ]

  partnerCountry!: any;
  benBankCountry!: any;
  shipperCountry!: any;

  currency = '';
  preselectedSenderAccount!: AccountsDto;
  preselectedSenderBlockAccount!: AccountsDto;
  preselectedReceiverAccount!: AccountsDto;
  preselectedSpecialAccount!: AccountsDto;
  countryDest = '';

  blockAccountsList = signal<AccountsDto[]>([])
  specialAccountList = signal<AccountsDto[]>([])
  receiverAccounts!: AccountsDto[];

  idnc: IDN[] = [];
  aims: any[] = [];
  countries: any[] = [];

  docDate = ''

  isEdit = false;
  isTemplate = false;
  templateId = '';

  conversionForm = new FormGroup({
    mode: new FormControl('CONVERSION_BUY'),
    docNum: new FormControl('', Validators.required),
    docDate:new FormControl <Date | null>(null, Validators.required),

    senderAccount: new FormControl('', Validators.required),
    senderBlockAccount: new FormControl('', Validators.required),
    receiverAccount: new FormControl('', Validators.required),
    receiverSpecialAccount: new FormControl('', Validators.required),

    sourceBuyCode: new FormControl('', Validators.required),
    aimCode: new FormControl('', Validators.required),
    aimName: new FormControl('', Validators.required),

    receiverCountryCode: new FormControl('', Validators.required),

    idnc: new FormControl (''),
    contractNumber: new FormControl (''),
    contractDate: new FormControl (''),
    partnerName: new FormControl (''),
    partnerCountry: new FormControl (''),
    shipperName: new FormControl (''),
    shipperCountry: new FormControl (''),

    benBankName: new FormControl(''),
    benBankCountry: new FormControl(''),

    termsPayment: new FormControl(''),
    currencyAmount: new FormControl(null, Validators.required),

    clientCurrencyOfferRate:new FormControl ('',),
    clientCurrencyOfferAmount:new FormControl (''),

    paymentStructure: new FormControl(1, Validators.required),
    detail: new FormControl(''),
    attachedFiles:new FormControl<string | null>(null),
  });

  getCurrencyOffer() {
    const senderAmount = this.conversionForm.value.currencyAmount;
    const senderAccount = this.conversionForm.value.senderAccount;
    const receiverAccount = this.conversionForm.value.receiverAccount;
    if (senderAmount && senderAccount && receiverAccount) {
      this._operationsService.getOfferAmount({
        senderAmount: +senderAmount * 100,
        senderAccount,
        receiverAccount,
        amountCurrency: this.currency,
      })
        .pipe(takeUntilDestroyed(this.#destroy))
        .pipe(debounceTime(300))
        .subscribe(val => {
          const rate = val.rate as any;
          const amount = `${rate.amount/Math.pow(10, rate.scale || 0)}`;
          const senderAmount = `${val.amount.amount/Math.pow(10, val.amount.scale)}`;

          this.conversionForm.patchValue({
            clientCurrencyOfferAmount: senderAmount,
            clientCurrencyOfferRate: amount,
          })
          this._cdRef.detectChanges()
        })
    }
  }

  selectIdnc(idn: IDN) {
    this.conversionForm.patchValue({
      contractNumber: idn.contractNumber,
      contractDate: idn.contractDate,
      partnerName: idn.partner,
      idnc: idn.idnc,
    });
  }

  getIdnc() {
    this._operationsService.getIdns()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        this.idnc = val;
      })
  }

  getCountries(searchText?: string) {
    this._operationsService.getCountries(searchText)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res) => {
          if(res) {
            this.countries = res;
            if(this.countryDest) {
              const country = res.find((c: any) => c.code === this.countryDest);
              if(country) {
                this.setCountryCode(country);
              }
            }
          }
        }
      })
  }

  setCountryCode(event: any) {
    this.conversionForm.patchValue({
      receiverCountryCode: event,
    });
  }

  setPartnerCountry(event: any) {
    this.conversionForm.patchValue({
      partnerCountry: event.name
    });
    this.partnerCountry = event;
  }

  setBenBankCountry(event: any) {
    this.conversionForm.patchValue({
      benBankCountry: event.name
    });
    this.benBankCountry = event;
  }

  setShipperCountry(event: any) {
    this.conversionForm.patchValue({
      shipperCountry: event.name
    });
    this.shipperCountry = event;
  }

  displayOption(option: any){
    if(option?.code) {
      return `${option.code} - ${option.name}`;
    }
    return '';
  }


  updateOffer() {
    this.conversionForm.get('currencyAmount')?.valueChanges
      .pipe(
        debounceTime(800),
        takeUntilDestroyed(this.#destroy)
      )
      .subscribe(() => this.getCurrencyOffer());
    this.conversionForm.get('senderAccount')?.valueChanges
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.#destroy)
      )
      .subscribe(() => this.getCurrencyOffer());

    this.conversionForm.get('receiverAccount')?.valueChanges
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.#destroy)
      )
      .subscribe(() => this.getCurrencyOffer());
  }

  getCurrencies() {
    this._accountPaymentService.getCurrencies()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res) => {
          if(res) {
            this.currencies = res;
          }
        }
      })
  }

  selectCurrency(curr: any) {
    this.currency = curr.name;
    this.getReceiverAccountList();
  }

  selectedSenderAccount(value: any) {
    this.conversionForm.patchValue({
      senderAccount: value.altAcctId,
    });
    this.getReceiverAccountList();
  }

  getSpecialAccounts(account?: any) {
    if(account?.altAcctId) {
      this.conversionForm.patchValue({
        senderBlockAccount: account.altAcctId
      });
    }
    this._accountPaymentService.getPaymentAllowed({page: 0, size: 100}, {
      senderAccount: this.conversionForm.getRawValue().senderBlockAccount,
      transactionMode: 'CONVERSION_BUY',
      accountType: 'RESERVED_CLIENT_FUNDS_FOR_CONVERSION',
      currency: this.currency,
    }).subscribe(res => {
      if (!res) return
      this.specialAccountList.set(res.content);
      if(account && typeof account === 'string') {
        this.preselectSpecialAccount(account);
      }
      this._cdRef.markForCheck();
    })
  }

  blockAccounts() {
    this._accountPaymentService.getPaymentAllowed({page: 0, size: 100}, {
      senderAccount: null,
      transactionMode: 'CONVERSION_BUY',
      accountType: 'RESERVED_CLIENT_FUNDS_FOR_CONVERSION'
    }).subscribe(res => {
      if (!res) return;
      this.blockAccountsList.set(res.content)
    })
  }

  getReceiverAccountList(account?: string) {
    this._accountPaymentService.getPaymentAllowed({
      page: 0,
      size: 100
    }, {
      senderAccount: `${this.conversionForm.value.senderAccount}`,
      transactionMode: 'CONVERSION_BUY',
      currency: this.currency,
    }).subscribe(res => {
      if (!res) return;
      this.receiverAccounts = res.content;
      if(account) {
        this.preselectReceiverAccount(account);
      }
    });
  }

  selectedReceiverAccount(value: any) {
    this.currency = value.balance.currency;
    this.conversionForm.patchValue({
      receiverAccount: value.altAcctId,
    });
    this.getSpecialAccounts();
  }

  selectedSpecialAccount(value: any) {
    this.conversionForm.patchValue({
      receiverSpecialAccount: value.altAcctId,
    });
  }

  getDocNum() {
    this._accountPaymentService.getTransactionDocNum()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        if (val) {
          this.conversionForm.patchValue({
            docNum: val.msg
          });
          this._cdRef.markForCheck();
        }
      })
  }

  ngOnInit(): void {
    this.watchRoute();
    this.getAccountsList();
    this.getDocNum();
    this.updateOffer();
    this.blockAccounts();
    this.getIdnc();
    this.getAim();
    this.getCurrencies();
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
        } else if (from === 'buy-template') {
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

  selectAction(action: any) {
    if(action.value === 'create') {
      this.onSubmit();
    }
  }

  checkTouched(fieldName: string) {
    const invalidFields = Object.keys(this.conversionForm.controls)
      .filter(fieldName => (this.conversionForm.get(fieldName)?.invalid && this.conversionForm.get(fieldName)?.touched));

    return invalidFields.includes(fieldName);
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
    this.preselectSenderAccount(res.sender.account);
    this.preselectSenderBlockAccount(res.additionalInfo.blockAcc);
    this.getReceiverAccountList(res.recipient.account);
    this.getSpecialAccounts(res.additionalInfo.specAcc);

    this.countryDest = res.additionalInfo?.countryDest || '';
    this.getCountries(res.additionalInfo.countryDest);

    this.conversionForm.patchValue({
      ...res.additionalInfo,
      detail: res.description,
      aimName: res.purpose.name,
      aimCode: res.purpose.code,
      receiverAccount: res.recipient.account,
      senderAccount: res.sender.account,
      termsPayment: +res.additionalInfo.termsPayment,
      sourceBuyCode: +res.additionalInfo.sourceBuyCode,
      currencyAmount: (+res.receiverAmount.amount || 0)/100,
    });
  }

  preselectSenderAccount(account: string) {
    const acc = this.accounts.find((el: any) => el.altAcctId === account);
    if(acc) {
      this.preselectedSenderAccount = acc;
    }
  }

  preselectSenderBlockAccount(account: string) {
    const acc = this.blockAccountsList().find((el: any) => el.altAcctId === account);
    if(acc) {
      this.preselectedSenderBlockAccount = acc;
      this.conversionForm.patchValue({
        senderBlockAccount: acc.altAcctId,
      })
    }
  }

  preselectReceiverAccount(account: string) {
    const acc = this.receiverAccounts.find((el: any) => el.altAcctId === account);
    if(acc) {
      this.preselectedReceiverAccount = acc;
    }
  }

  preselectSpecialAccount(account: string) {
    const acc = this.specialAccountList().find((el: any) => el.altAcctId === account);
    if(acc) {
      this.preselectedSpecialAccount = acc;
      this.conversionForm.patchValue({
        receiverSpecialAccount: acc.altAcctId,
      })
    }
  }

  getBody() {
    const body = this.conversionForm.getRawValue() as any;
    body.documentUrl = body.attachedFiles ? body.attachedFiles : "";
    body.receiverCountryCode = `${body.receiverCountryCode?.code}`;
    body.paymentStructure = +body.paymentStructure;
    body.partnerCountry = this.partnerCountry?.code;
    body.shipperCountry = this.shipperCountry?.code;
    body.benBankCountry = this.benBankCountry?.code;
    body.isSaved = false;
    delete body.attachedFiles;
    delete body.clientCurrencyOfferRate;
    delete body.clientCurrencyOfferAmount;

    return body;
  }

  onSubmit(type = 'DEFAULT') {
    this.conversionForm.markAllAsTouched();
    if (this.conversionForm?.valid) {
      const body = this.getBody();
      body.currencyAmount = Number(body.currencyAmount) * 100;
      body.docDate = this.conversionForm.value.docDate;

      if(type === 'SAVE') {
        body.isSaved = true;
        this.createTemplateCurrencyBuy(body);
      } else if(type === 'SUBMIT') {
        this.send(body)
      } else {
        this.createCurrencyBuy(body);
      }
    }
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
          this.router.navigate(['/currency-buy']);
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

  createCurrencyBuy(body: any) {
    this._utilsService.spinnerState$$.next(true);

    this._operationsService.createConversion(body)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res) => {
          if (!res) return;
          this.toastrService.success('Успешно!');
          this.router.navigate(['/currency-buy']);
          this._utilsService.spinnerState$$.next(false);
        },
        error: (err: any) => {
          this.toastrService.error(err?.message || err);
          this._utilsService.spinnerState$$.next(false);
        }
      });
  }

  createTemplateCurrencyBuy(body: any) {
    this.matDialog.open(TemplateNameComponent, {
      data: {
        title: 'Введите название шаблона',
      }
    }).afterClosed().subscribe({
      next: (name: string) => {
        if(name) {
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
    });
  }

  editTemplateCurrencyBuy() {
    this.conversionForm.markAllAsTouched();
    if(this.conversionForm.invalid) return;
    this.matDialog.open(TemplateNameComponent, {
      data: {
        title: 'Введите название шаблона',
      }
    }).afterClosed().subscribe({
      next: (name: string) => {
        if(name) {
          this._accountPaymentService.deleteSavedPayment(this.templateId)
            .pipe(takeUntilDestroyed(this.#destroy))
            .subscribe({
              next: (res) => {
                if(res) {
                  this._utilsService.spinnerState$$.next(true);
                  const body = this.getBody();

                  body.currencyAmount = Number(body.currencyAmount) * 100;
                  body.docDate = this.conversionForm.value.docDate;

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
                this.toastrService.error(err.message || err || 'Что-то пошло не так...');
                this._utilsService.spinnerState$$.next(false);
              }
            })
        }
      },
    });
  }

  getAim() {
    this._operationsService.getAims()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res) => {
          if(res) {
            this.aims = res;
          }
        }
      })
  }

  getAccountsList() {
    this._accountPaymentService.getPaymentAllowed({page: 0, size: 100}, {
      senderAccount: null,
      transactionMode: 'CONVERSION_BUY'
    }).subscribe(res => {
      if (!res) return;
      this.accounts = res.content;
    })
  }

  triggerFileUpload(): void {
    document.getElementById('fileUpload')?.click();
  }

  handleFileChange(event: any): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.file = file;
    if (file) {
      this._accountPaymentService.fileUpload(file).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
        if (!res) return;
        this.conversionForm.patchValue({
          attachedFiles: res.downloadUrl
        })
      });

      input.value = '';
    }
  }

  clearFile() {
    this.file = undefined;
    this.conversionForm.patchValue({
      attachedFiles: '',
    })
  }

  panelState = false;

  getDocDate(date:any) {
    let d: Date = date;
    if(typeof date === 'string') {
      d = new Date(date);
    }
    this.conversionForm.patchValue({
      docDate: d
    })
    this.docDate = date
  }
}
