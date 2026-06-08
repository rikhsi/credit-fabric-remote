import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { UiSvgIconComponent } from '../../../../../../core/components/ui-svg-icon/ui-svg-icon.components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { OperationsService } from '../../services/operations.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule, } from '@angular/material/datepicker';
import { debounceTime, pairwise, startWith, take } from 'rxjs';
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
import { WidgetsComponent } from '../../../../../../shared/components/widgets/widgets.component';
import { ConversionService } from '../../../../../../core/services/conversion.service';
import { RightBarService } from '../../../../right-bar/services/right-bar.service';
import { LocationBackDirective } from '../../../../../../shared/directives/location-back.directive';

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
        WidgetsComponent,
        RouterLinkActive,
        LocationBackDirective,
    ],
    providers: [],
    templateUrl: './create-cross-conversion.component.html',
    styleUrls: ['./create-cross-conversion.component.scss'],
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CreateCrossConversionComponent implements OnInit {
  title = 'Заявка на конверсию';
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

  tabs = [
    {
      title: 'В пределах онлайн лимита (50 000$)',
      value: 'below-limit',
    },
    {
      title: 'Свыше лимита',
      value: 'above-limit'
    },
  ];

  tab = '';
  uploadedFile: File | null = null;
  isUnderLimit = true;
  direct = true;

  templateModes = ['CONVERSION_SELL'];
  private fb = inject(FormBuilder);
  private _utilsService = inject(UtilsService);
  private _operationsService = inject(OperationsService);
  private _cdRef = inject(ChangeDetectorRef);
  private _accountPaymentService = inject(AccountsPaymentsService);
  private conversionSservice = inject(ConversionService);
  private rightBarService = inject(RightBarService);
  #destroy = inject(DestroyRef);

  constructor(
    private toastrService: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  inputClasses = 'rounded-12px border-1px border-secondary w-full h-11 px-2 outline-none';

  accounts!: AccountsDto[];
  receiverAccounts!: AccountsDto[];
  preSelectedSenderAccount!: AccountsDto;
  preSelectedReceiverAccount!: AccountsDto;

  currencies: any[] = [];
  receiverCurrencies: any[] = [];

  currencyFromName = '';
  currencyToName = '';


  docDate =  '';

  conversionForm = this.fb.group({
    docNum: ['', Validators.required],
    docDate: ['', Validators.required],
    senderAccount: ['', Validators.required],
    receiverAccount: ['', Validators.required],
    mode: ['CROSS_CONVERSION', Validators.required],

    currencyAmount: ['', Validators.required],

    documentUrl: [''],

    detail: [''],

    clientCurrencyOfferRate: [''],
    clientCurrencyOfferAmount: [''],

    receiverAmount: [''],

    fromCurrency: [''],
    toCurrency: [''],
  });

  updateOffer() {
    this.conversionForm.get('currencyAmount')?.valueChanges
      .pipe(
        debounceTime(800),
        takeUntilDestroyed(this.#destroy)  // Ensure it cleans up when the component is destroyed
      )
      .subscribe(() => {
        if(this.direct) {
          this.getCurrencyOffer();
        }
        this.getLimit();
      });

    // Optionally, listen to sender and receiver changes as well
    this.conversionForm.get('senderAccount')?.valueChanges
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.#destroy)
      )
      .subscribe(() => {
        this.getCurrencyOffer();
        this.getLimit();
      });

    this.conversionForm.get('receiverAccount')?.valueChanges
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.#destroy)
      )
      .subscribe(() => this.getCurrencyOffer());
  }

  selectedSenderAccount(value: any, stop = false) {
    this.conversionForm.patchValue({
      senderAccount: value.altAcctId,
    });
    this.currencyFromName = value.balance.currency;
    if(stop) return;
    this.getReceiverAccountList();
  }

  selectedReceiverAccount(value: any) {
    this.conversionForm.patchValue({
      receiverAccount: value.altAcctId,
    });
    this.currencyToName = value.balance.currency;
  }

  getDocNum() {
    this._accountPaymentService.getTransactionDocNum()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        if(val) {
          this.conversionForm.patchValue({
            docNum: val.msg
          });
          this._cdRef.markForCheck();
        }
      })
  }

  ngOnInit(): void {
    this.getDocNum();
    this.updateOffer();
    this.getCurrencies({currencyType: 'CROSS_CONVERSION'});
    this.watchRoute();
  }

  watchRoute() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((params) => {
        const tab= params['tab'];
        if(!tab) {
          this.router.navigate(['create-cross-conversion'], {
            queryParams: {
              tab: this.tabs[0].value,
            }
          })
        }
        this.tab = tab;

        const documentUrlControl = this.conversionForm.controls['documentUrl'];

        if(tab === this.tabs[1].value) {
          this.isUnderLimit = true;
          documentUrlControl.addValidators(Validators.required);
        } else {
          this.conversionForm.patchValue({
            documentUrl: '',
          })
          documentUrlControl.removeValidators(Validators.required);
          this.getLimit();
        }

        documentUrlControl.updateValueAndValidity();
      })
  }

  onSubmit() {
    if (this.conversionForm.valid) {
      this._utilsService.spinnerState$$.next(true);

      const body = this.conversionForm.getRawValue() as any;

      delete body.clientCurrencyOfferRate;
      delete body.clientCurrencyOfferAmount;
      delete body.receiverAmount;
      delete body.fromCurrency;
      delete body.toCurrency;

      body.currencyAmount = body.currencyAmount * 100;

      this._operationsService.createConversion({
        ...body,
        docDate: new Date().toISOString(),
      })
        .pipe(takeUntilDestroyed(this.#destroy))
        .subscribe({
            next: (res) => {
              if (!res) return
              this.toastrService.success('Успешно');
              this.router.navigate(['/conversion-operations']);
            },
            error: (err: any) => {
              this._utilsService.spinnerState$$.next(false);
              this.toastrService.error(err || err.message || 'Что то пошло не так...');
            }
        });
    }
  }

  uploadDocument() {
    this._accountPaymentService
      .fileUpload(this.uploadedFile)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(res => {
      if (!res) return;
      this.conversionForm.patchValue({
        documentUrl: res.downloadUrl
      })
    });
  }

  getLimit() {
    const senderAccount = this.conversionForm.value.senderAccount;
    const amount = +(this.conversionForm.value.currencyAmount as any) * 100 || 0;
    this.conversionSservice.getLimit(senderAccount?.slice(5, 8), amount)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(res => {
        if(res) {
          this.isUnderLimit = res.isUnderLimit;
        }
      });
  }

  getCurrencies(params?: { currencyType?: string, senderCurrency?: string }) {
    this._accountPaymentService.getCurrencies(params)
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

  getReceiverCurrencies(params?: { currencyType?: string, senderCurrency?: string }) {
    this._accountPaymentService.getCurrencies(params)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res) => {
          if(res) {
            this.receiverCurrencies = res;
            this._cdRef.markForCheck();
          }
        }
      })
  }

  toggleForm() {
    const from = this.conversionForm.value.fromCurrency as string;
    const to = this.conversionForm.value.toCurrency as string;

    const fromAccount = this.conversionForm.value.senderAccount as string;
    const toAccount = this.conversionForm.value.receiverAccount as string;

    this.conversionForm.patchValue({
      fromCurrency: to,
      toCurrency: from,
      senderAccount: toAccount,
    });

    this.getAccountsList(toAccount);
    this.getReceiverAccountList(fromAccount);
  }

  getAccountsList(preselectedAccount?: string) {
    const currency = this.conversionForm.value.fromCurrency as string;
    this.getReceiverCurrencies({ currencyType: 'CROSS_CONVERSION', senderCurrency: currency });
    if(currency) {
      this._accountPaymentService.getPaymentAllowed(
        {page: 0, size: 100},
        { senderAccount: null, transactionMode: 'CROSS_CONVERSION', currency })
        .pipe(takeUntilDestroyed(this.#destroy))
        .subscribe(res => {
          if (!res) return;
          this.accounts = res.content;
          if(preselectedAccount) {
            const acc = this.accounts.find(a => a.altAcctId === preselectedAccount);
            if(acc) {
              this.selectedSenderAccount(acc, true);
              this.preSelectedSenderAccount = acc;
            }
          }
        })
    }
  }

  getReceiverAccountList(preselectedAccount?: string) {
    const currency = this.conversionForm.value.toCurrency as string;
    if(currency) {
      this._accountPaymentService.getPaymentAllowed(
        {page: 0, size: 100},
        {
          senderAccount: `${this.conversionForm.value.senderAccount}`,
          transactionMode: 'CROSS_CONVERSION',
          currency,
        })
        .pipe(takeUntilDestroyed(this.#destroy))
        .subscribe(res => {
          if (!res) return;
          this.receiverAccounts = res.content;
          if(preselectedAccount) {
            const acc = this.receiverAccounts.find(a => a.altAcctId === preselectedAccount);
            if(acc) {
              this.selectedReceiverAccount(acc);
              this.preSelectedReceiverAccount = acc;
            }
          }
        });
    }
  }

  setDocDate(date: any) {
    let d: Date = date;
    if(typeof date === 'string') {
      d = new Date(date);
    }
    this.conversionForm.patchValue({
      docDate: d.toString(),
    });
    this.docDate = date;
  }

  getCurrencyOffer() {
    const senderAmount = +(this.conversionForm.value.currencyAmount as any);
    const receiverAmount = +(this.conversionForm.value.receiverAmount as any);
    const senderAccount = this.conversionForm.value.senderAccount;
    const receiverAccount = this.conversionForm.value.receiverAccount;
    let amountCurrency = this.currencyToName;
    for(let i=0; i<this.currencies.length; i++) {
      const el = this.currencies[i];
      if(el.name === amountCurrency) {
        amountCurrency = el.code;
        break;
      }
    }
    if(senderAccount && receiverAccount && ((senderAmount && this.direct) || (receiverAmount && !this.direct))) {
      const receiverCurrency = this.direct ? this.currencyFromName : this.currencyToName;
      const curr = this.currencies.find(c => c.name == receiverCurrency);
      const amount = this.direct ? senderAmount * 100 : receiverAmount * 100;

      const requestBody = {
        senderAmount: amount,
        senderAccount,
        receiverAccount,
        amountCurrency: curr.code
      };
      this._operationsService.getOfferAmount(requestBody)
        .pipe(takeUntilDestroyed(this.#destroy))
        .pipe(debounceTime(300))
        .subscribe({
          next: val => {
            const rate = val.rate as any;
            const amount = `${rate.amount/Math.pow(10, rate.scale || 0)}`;
            const receiverAmount = `${val.receiverAmount.amount/Math.pow(10, val.receiverAmount.scale || 0)}`;
            const senderAmount = `${val.amount.amount/Math.pow(10, val.amount.scale || 0)}`;

            if(this.direct) {
              this.conversionForm.patchValue({
                clientCurrencyOfferAmount: `${val.clientCurrencyOfferAmount / 100}`,
                clientCurrencyOfferRate: amount,
                receiverAmount,
              });
            } else {
              this.conversionForm.patchValue({
                clientCurrencyOfferAmount: `${val.clientCurrencyOfferAmount / 100}`,
                clientCurrencyOfferRate: amount,
                currencyAmount: senderAmount,
              });
              setTimeout(() => {
                this.direct = true;
              }, 1000);
            }
          }
        })
    }
  }

  getReceiverOffer() {
    this.direct = false;
    this.getCurrencyOffer();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadedFile = input.files[0];

      this.handleFileChange();
    }
  }

  removeFile(): void {
    this.uploadedFile = null;
  }

  handleFileChange(): void {
    this._accountPaymentService
      .fileUpload(this.uploadedFile)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(res => {
      if (!res) return;
      this.conversionForm.patchValue({
        documentUrl: res.downloadUrl
      })
    });
  }
}
