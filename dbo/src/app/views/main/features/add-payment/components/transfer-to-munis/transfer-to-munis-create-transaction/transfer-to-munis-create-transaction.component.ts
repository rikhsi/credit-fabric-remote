import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  signal
} from "@angular/core";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {ThemeService} from "../../../../../../../shared/services/theme.service";
import {firstValueFrom, Subject, take} from "rxjs";
import {PaymentService} from "../../../../../../../core/services/payment.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {
  CheckServicePayload,
  MunisCategoryListDto,
  ServiceDTO,
  ServiceParam
} from "../../../../accounts-payments/models/accounts-payments.model";
import {MatDivider} from "@angular/material/divider";
import {NgxMaskDirective, NgxMaskPipe} from "ngx-mask";
import {animate, style, transition, trigger} from "@angular/animations";
import {Account} from "../../transfer-to-account/transfer-to-account.component";
import {AmountService} from "../../../../../../../core/services/amount.service";
import {AccountService} from "../../../../../../../core/services/account.service";
import {SpinnerComponent} from "../../../../../../../core/components/spinner/spinner.component";
import {ToastrService} from "ngx-toastr";
import { UtilsService } from "../../../../../../../core/services/utils.service";
import {environment} from "../../../../../../../../environments/environment";
import {AgreeModalComponent} from "../../../../../../../shared/components/agree-modal/agree-modal.component";
import {MatDialog} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";
import {
  SuccessMunisModalComponent
} from "../../../../../../../shared/components/success-munis-modal/success-munis-modal.component";
import {DetailsOfficeModalComponent} from "../my-office/modals/details-office-modal/delails-office-modal.component";
import {AddToMyOfficeModalComponent} from "../my-office/modals/add-my-office-modal/add-to-my-office-modal.component";
import {FirebaseAnalyticsService} from "../../../../../../../../../firebase-analytics.service";
import { NumericOnlyDirective } from "src/app/shared/directives/numeric-only.directive";

@Component({
  selector: 'app-transfer-to-munis-create-transaction',
  imports: [ NumericOnlyDirective, CommonModule, MatTooltipModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, RouterModule, ReactiveFormsModule, FormsModule, TranslateModule, NgOptimizedImage, MatDivider, NgxMaskDirective, NgxMaskPipe, SpinnerComponent],
  templateUrl: './transfer-to-munis-create-transaction.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      ::ng-deep .custom-select1.mat-mdc-form-field.mat-form-field-appearance-outline .mat-mdc-text-field-wrapper {
        border-radius: 22px !important; // radius kattaroq
        background: #FAFAFA; // fon rang
      }

      ::ng-deep .custom-select1 .mdc-notched-outline {
        border-color: #E4E4E4 !important; // outline rang
      }

      ::ng-deep .custom-select1.mat-mdc-form-field {
        padding: 0; // yuqori/pastki ortiqcha joyni olib tashlash
      }

      ::ng-deep .mat-calendar-body-selected {
        background-color: #00A38D !important;
      }

    `
  ],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scaleY(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scaleY(0)' })),
      ]),
    ]),
  ]
})

export class TransferToMunisCreateTransactionComponent implements OnInit {
  @Input() docDate!: any;

  protected theme = inject(ThemeService);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  private paymentService =  inject(PaymentService);
  private destroyRef=  inject(DestroyRef);
  private amountsService = inject(AmountService);
  private accountService = inject(AccountService);
  private _cdRef = inject(ChangeDetectorRef);
  private toast = inject(ToastrService);
  private utilsService = inject(UtilsService);
  private matDialog = inject(MatDialog);
  private _http = inject(HttpClient);
  private analyticsService = inject(FirebaseAnalyticsService);
  inputSubject = new Subject<any>();
  private amountChange$ = new Subject<void>();
  openAccount = false;
  balanceErrorOver = "";
  amountInWords = '';
  openFindPurposes = false;
  touchedParams = new Set<string>();
  private destroy$ = new Subject<void>();
  private API_URL = `${environment.API_BASE}`;

  searchText = signal<string>('');
  serviceName = signal<string>('');
  minDate = signal<any>('');
  selectId = signal<any>('');
  choosedAcount = signal<Account | Record<string, any>>({});
  categoryList = signal<MunisCategoryListDto[] | null>([]);
  accounts = signal<any[]>([]);
  spinnerState = signal<boolean>(false);
  serviceChildError = signal<boolean>(false);
  editableAmount = signal<boolean>(true);
  servicesList = signal<ServiceDTO | null>(null);
  recipientName = signal<string>('');
  paramsList = signal<ServiceParam[]>([]);
  checkParams = signal<CheckServicePayload | null>(null);

  selectedParams = signal<Array<{
    id: string;
    value: string;
    prefix?: string,
    suffix?: string,
  }>>([]);


  createForm: FormGroup = new FormGroup({
    senderAccount: new FormControl(''),
    docNum: new FormControl(''),
    docDate: new FormControl(null, Validators.required),
    amount: new FormGroup({
      amount: new FormControl(null),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    balance: new FormGroup({
      amount: new FormControl(null, [Validators.required, Validators.min(0.01)]),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    recipientId: new FormControl(''),
    params: new FormGroup([]),
    description: new FormControl("", [Validators.required, Validators.maxLength(450)]),
    isAutoPay: new FormControl(false),
  });


 async ngOnInit() {
   this.analyticsService.logFirebaseCustomEvent('munis_create_payment_screen_jump', {screen: "main"});
   this.spinnerState.set(true);
   // if () {
   //   this.initParamsForEdit({})
   // }
   // this.amountChange$
   //   .pipe(
   //     debounceTime(1000),
   //     takeUntil(this.destroy$)
   //   )
   //   .subscribe(() => {
   //     if (this.validateAll() && !this.serviceChildError()) {
   //       this.serviceCheck();
   //     }
   //   });
   const redirectUrl = this.route.snapshot.queryParamMap.get('serviceName')
   if (redirectUrl) {

   }
    try {
      this.getServices();
      if (this.route.snapshot.queryParamMap.get('serviceName')) {
        this.serviceName.set(this.route.snapshot.queryParamMap.get('serviceName') as string)
      }
      await Promise.all([
        this.getDocDate(),
        this.getDocNumber(),
        this.getAccounts1(),
        this.getServiceOne()
      ]);
    } catch (e) {

    } finally {
      this.spinnerState.set(false);
      this._cdRef.detectChanges();
    }

   this.analyticsService.logFirebaseCustomEvent('munis_create_payment_screen_jump', {platform: "web"});

 }


  async getDocNumber(): Promise<void> {
    const type = this.route.snapshot.queryParamMap.get('type');
    if (type !== 'edit') {
      const res = await firstValueFrom(this.paymentService.getPaymentDocNum());
      this.createForm.patchValue({
        docNum: res.msg
      });
    }
  }

  async getAccounts1(): Promise<void> {
    const accounts = await firstValueFrom(
      this.accountService.getPaymentAllowed(
        { size: 100, page: 0 },
        { transactionMode: "MUNIS", senderAccount: null }
      )
    );

    if (accounts) {
      if (accounts.content?.length > 0) {
        const firstActive = accounts.content.find(item => item.status !== 'BLOCKED');
        if (firstActive) {
          this.choosedAcount.set(firstActive);
        }

        this.createForm.patchValue({
          sender: {
            account: accounts.content[0].altAcctId
          }
        });
      }

      this.accounts.set(accounts.content ?? []);
      this._cdRef.detectChanges();
    }
  }

  getDetails() {
   const serviceId = this.route.snapshot.queryParamMap.get('childServiceId');
    this.paymentService.getMunisServicesOne({id: serviceId}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {

      },
      error: err => {

      }
      }
    )
  }

  integerPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

  setSuggestAmount(amount: number) {
   this.createForm.patchValue({
     balance: {
       amount: amount / 100
     }
   })
    this.convertAmountIntoWords();
  }

  serviceCheck() {
    this.utilsService.spinnerState$$.next(true);
    this.paymentService.MunisServicesCheck({
      id: this.createForm.getRawValue().recipientId,
      params: this.selectedParams()
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.utilsService.spinnerState$$.next(false);
          this.checkParams.set(data)
          this.createForm.patchValue({
            description: data.purpose
          })
          if (data?.amount && data?.amount?.amount > 0) {
            this.createForm.patchValue({
              balance: {
                amount: data.amount.amount / 100
              },
            })
          }
          this.convertAmountIntoWords();
        },
        error: error => {
          this.utilsService.spinnerState$$.next(false);
          this.toast.error(error.message);
        }
      })
  }


  setParamValue(paramId: string, value: string) {
    this.checkParams.set(null);
    const existing = this.selectedParams().find(p => p.id === paramId);

    if (existing) {
      existing.value = value?.replaceAll(' ', '');
    } else {
      this.selectedParams().push({ id: paramId, value: value.replaceAll(' ', '') });
    }
  }

  removeParamValue(paramId: string) {
    this.selectedParams.set(this.selectedParams().filter(
      p => p.id !== paramId
    ))
  }

  getParamValue(paramId: string): string | null {
    return this.selectedParams().find(p => p.id === paramId)?.value ?? null;
  }

  setParamValueToInput(param: ServiceParam) {
    return param.selectValue
      ?.find(v => v.value === this.getParamValue(param.id))
      ?.title ?? ''
  }

  toggleDropdown() {
    this.openFindPurposes = !this.openFindPurposes;
  }

  // getParamsAndSet() {
  //   this.utilsService.spinnerState$$.next(true);
  //   const parentId = this.route.snapshot.queryParamMap.get('parentId');
  //   const officeId = this.route.snapshot.queryParamMap.get('officeId');
  //   this.paymentService.getOfficeServicesOne(officeId as string).pipe().subscribe({
  //     next: result => {
  //       this.selectedParamsService.set(result?.params)
  //       this.paymentService.getMunisServicesOne({id: parentId}).pipe(takeUntilDestroyed(this.destroyRef))
  //         .subscribe({
  //           next: data => {
  //             if (!data.hasChild) {
  //               this.paramsList.set(data.params)
  //             } else {
  //               this.serviceList.set(data)
  //             }
  //             this.utilsService.spinnerState$$.next(false);
  //             if ( this.selectedParamsService().length > 0) {
  //               this.openCreateModal.set(true);
  //             }
  //           },
  //           error: error => {
  //             this.toast.error(error.message);
  //             this.utilsService.spinnerState$$.next(false);
  //           }
  //         })
  //     },
  //     error: error => {
  //
  //     }
  //   });
  //
  // }

  setChildService(serviceId: string, serviceName: string, fromOffice?: boolean) {
      if (serviceId === this.createForm.getRawValue().recipientId) {
        return
      }
     this.createForm.patchValue({
       recipientId: serviceId,
     })

    if (!fromOffice) {
      this.paramsList.set([]);
      this.selectedParams.set([]);
    }
    this.touchedParams.clear();
    this.recipientName.set(serviceName);
    this.paymentService.getMunisServicesOne({id: serviceId}).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.utilsService.spinnerState$$.next(false);
          this.paramsList.set(data.params);
          this.editableAmount.set(data.editable);
          if (fromOffice) {
            setTimeout(() => {
              this.initParamsForEdit(this.selectedParams());
            }, 500)
            setTimeout(() => {
              this.serviceCheck()
            }, 1000)
          }
        },
        error: error => {
          this.utilsService.spinnerState$$.next(false);
          this.toast.error(error.message);
        }
      })
    this.serviceChildError.set(false);
    this._cdRef.detectChanges();
  }

  isInvalid(param: any): boolean {
    if (!param.required) return false;

    const value = this.getParamValue(param.id);
    return this.touchedParams.has(param.id) && !value;
  }

  validateAll(): boolean {
    this.paramsList().forEach(param => {
      if (param.required) {
        this.touchedParams.add(param.id);
      }
    });

    return this.paramsList().every(param => {
      if (!param.required) return true;
      return !!this.getParamValue(param.id);
    });
  }


  async getServices() {
      this.paymentService.getMunisServices({parentId: this.route.snapshot.queryParamMap.get('serviceId')}).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: data => {
            this.categoryList.set(data.categories)
          },
          error: error => {

          }
        })
  }

  onSelect(paramId: string, option: any) {
    this.checkParams.set(null);
    this.touchedParams.add(paramId);
    this.setParamValue(paramId, option.value);
    const params = this.paramsList();
    const currentParam = params.find(p => p.id === paramId);
    if (!currentParam) return;

    currentParam.value = option.value;
    this.updateBoundSelects(currentParam.id, option.children ?? []);
    this.selectId.set('');
  }

  updateBoundSelects(parentId: string, children: any[]) {
    this.paramsList().forEach(param => {
      if (param.bind === parentId) {
        if (children?.length === 0) {
          this.removeParamValue(param.id)
        }
        param.selectValue = children;
        param.value = '';
      }
    });
  }

  resetBoundParams(parentId: string) {
    this.paramsList().forEach(param => {
      if (param.bind === parentId) {
        param.value = '';
        param.selectValue = [];
        this.resetBoundParams(param.id);
      }
    });
  }

  initParamsForEdit(saved: any) {
      const params = this.paramsList();
      const savedMap: any = new Map(saved.map((x: any) => [x.id, x.value]));

      params.forEach(p => {
        const v: any = savedMap.get(p.id);
        if (v !== undefined && v !== null) {
          p.value = v;
          this.setParamValue(p.id, v);
        } else {
          p.value = '';
          this.removeParamValue?.(p.id);
        }
      });

      params
        .filter(p => p.type === 'SELECT' && !p.bind)
        .forEach(rootSelect => {
          this.restoreSelectChain(rootSelect.id, savedMap);
        });
  }

  private restoreSelectChain(parentId: string, savedMap: Map<string, any>) {
      const params = this.paramsList();
      const parent = params.find(p => p.id === parentId);
      if (!parent || parent.type !== 'SELECT') return;

      const parentValue = savedMap.get(parentId);
      if (!parentValue) {
        this.resetBoundParams(parentId);
        return;
      }

      const selectedOption: any = (parent.selectValue ?? []).find(opt => opt.value === parentValue);

      const childrenOptions = selectedOption?.children ?? [];

      params.forEach(childParam => {
        if (childParam.bind !== parentId) return;

        childParam.selectValue = childrenOptions;

        const childSavedValue = savedMap.get(childParam.id);
        if (childSavedValue) {
          childParam.value = childSavedValue;
          this.setParamValue(childParam.id, childSavedValue);
          this.restoreSelectChain(childParam.id, savedMap);
        } else {
          childParam.value = '';
          this.removeParamValue?.(childParam.id);
          this.resetBoundParams(childParam.id);
        }

        if (!childrenOptions || childrenOptions.length === 0) {
          childParam.value = '';
          this.removeParamValue?.(childParam.id);
        }
      });
  }



  async getDocDate(): Promise<void> {
      const res = await firstValueFrom(this.accountService.getOperDayNew());

      const [day, month, year] = res.operDay.split('.').map(Number);
      const formattedDate = new Date(year, month - 1, day);
      this.createForm.patchValue({ docDate: formattedDate });
      this.docDate = formattedDate;
      this.minDate.set(formattedDate);
  }


  backClick() {
   const redirectUrl = this.route.snapshot.queryParamMap.get('redirectUrl')
   if (redirectUrl) {
     this.router.navigateByUrl(redirectUrl);
   } else {
     this.router.navigate(['../services'], {
       relativeTo: this.route,
       replaceUrl: true,
       queryParams: {
         parentId: this.route.snapshot.queryParamMap.get('parentId'),
         parentName: this.route.snapshot.queryParamMap.get('parentName'),
       }
     });
   }
  }

  closeBtn() {
    const redirectUrl = this.route.snapshot.queryParamMap.get('redirectUrl')
    if (redirectUrl) {
      this.router.navigateByUrl(redirectUrl);
    } else {
      this.router.navigate(['payment']);
    }
  }

  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;

    const normalized = value.toString().replace(/\s/g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  async getServiceOne() {
    const officeId = this.route.snapshot.queryParamMap.get('officeId')
    const serviceName = this.route.snapshot.queryParamMap.get('childServiceName')
    const serviceId = this.route.snapshot.queryParamMap.get('childServiceId')
    const childId = this.route.snapshot.queryParamMap.get('childId')
    const childName = this.route.snapshot.queryParamMap.get('childName')
    const transactionId = this.route.snapshot.queryParamMap.get('transactionId')
    const type = this.route.snapshot.queryParamMap.get('type')
    const fromSearch = this.route.snapshot.queryParamMap.get('fromSearch')
    if (fromSearch) {
      this.paymentService.getMunisServicesOne({id: this.route.snapshot.queryParamMap.get('serviceId')}).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: data => {
            if (!data.hasChild) {
              this.paramsList.set(data.params);
              this.createForm.patchValue({
                recipientId: this.route.snapshot.queryParamMap.get('serviceId')
              })
            }
            this.servicesList.set(data);
            this.setChildService(childId as string, childName as string)
          },
          error: error => {
            this.toast.error(error.message);
          }
        })
    }
    if (this.route.snapshot.queryParamMap.get('serviceId')) {
        this.paymentService.getMunisServicesOne({id: this.route.snapshot.queryParamMap.get('serviceId')}).pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: data => {
              if (!data.hasChild) {
                this.paramsList.set(data.params);
                this.createForm.patchValue({
                  recipientId: this.route.snapshot.queryParamMap.get('serviceId')
                })
              }
              this.servicesList.set(data)
            },
            error: error => {
              this.toast.error(error.message);
            }
          })
    }

    if (officeId) {
      this.paymentService.getOfficeServicesOne(officeId as string).pipe().subscribe({
        next: (result: any) => {
          this.selectedParams.set(result.params);
          this.setChildService(serviceId as string, serviceName as string, true)
        },
        error: (err: any) => {
          this.toast.error(err.message || '');
        }
      })
    }

    if (transactionId) {
      this.paymentService.getTransactionOne(transactionId).pipe().subscribe({
        next: (result: any) => {
          this.selectedParams.set(result.params);
          this.paymentService.getMunisServicesOne({id: result.parentServiceId}).pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: data => {
                if (!data.hasChild) {
                  this.paramsList.set(data.params);
                  this.createForm.patchValue({
                    recipientId: result.parentServiceId
                  })
                }
                this.servicesList.set(data)
                const findService = data?.childServices?.find(item => item.id === result.recipientId)
                if (findService) {
                  this.recipientName.set(findService.title)
                  this.paymentService.getMunisServicesOne({id: findService.id }).pipe().subscribe({
                    next: (child: any) => {
                      this.paramsList.set(child.params);
                      this.setChildService(findService.id, findService.title, true)
                    },
                    error: (err: any) => {
                      this.toast.error(err.message || '');
                    }
                  })
                }
                setTimeout(() => {
                  const findAccount = this.accounts()?.find(account => account.altAcctId === result.sender.account);
                  if (findAccount) {
                    this.choosedAcount.set(findAccount)
                  }
                  this.createForm.patchValue({
                    senderAccount: findAccount ? findAccount.altAcctId : this.choosedAcount().altAcctId,
                    balance: {
                      amount: result.senderAmount.amount / 100
                    },
                    description: result.description
                  })
                  if (type === 'edit') {
                    this.createForm.patchValue({
                      docNum: result.docNum,
                    })
                  }
                }, 1000)
              },
              error: error => {
                this.toast.error(error.message);
              }
            })
        },
        error: (error) => {
        }
      })
    }
  }

  checkService() {
    if (this.servicesList() && this.servicesList()?.hasChild) {
      if (!this.createForm.getRawValue().recipientId) {
         return this.serviceChildError.set(true);
      }
    } else {
      this.validateAll();
    }

    if (this.validateAll() && !this.serviceChildError()) {
      this.serviceCheck();
    }
  }

  convertAmountIntoWords() {

   // if (this.servicesList() && this.servicesList()?.hasChild) {
   //   if (!this.createForm.getRawValue().recipientId) {
   //      return this.serviceChildError.set(true);
   //   }
   // } else {
   //   this.validateAll();
   // }
    const formValue = this.createForm.getRawValue();
    const entered = this.parseNumber(formValue?.balance?.amount ?? 0);
    const max = this.parseNumber(this.choosedAcount().balance?.amount
      ? this.choosedAcount().balance.amount / 100
      : 0);

    let validAmount = entered;
    if (entered > max) {
      this.balanceErrorOver = "На счёте недостаточно средств";
    } else {
      this.balanceErrorOver = "";
    }

    if (validAmount) {
      this.amountInWords = this.amountsService.numberToWordsRU(validAmount);
    } else {
      this.amountInWords = '';
    }


    // this.amountChange$.next()
  }

  chooseAccFunc(account) {
    this.choosedAcount.set(account);
    this.convertAmountIntoWords();
  }


  handleDuplicateDocNumber(message: string) {
    this.matDialog.open(AgreeModalComponent, {
      data: {
        title: message
      }
    }).afterClosed()
      .subscribe((res: any) => {
        // if (res === 'agree') {
        //   this.utilsService.spinnerState$$.next(true);
        //   this.submit()
        // }
      });
  }

  openDetails() {
    this.matDialog.open(DetailsOfficeModalComponent, {
      width: '500px',
      panelClass: 'info-munis-dialog',
      data: {
        docDate: this.createForm.getRawValue().docDate,
        docNum: this.createForm.getRawValue().docNum,
        amount: this.createForm.getRawValue().balance,
        account: this.choosedAcount(),
        recipient: this.checkParams(),
        description: this.createForm.getRawValue().description,
      }
    });
  }

  editTransaction() {
   const transactionId = this.route.snapshot.queryParamMap.get('transactionId')
    this.validateAll();
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.utilsService.spinnerState$$.next(true);
    const rawDocDate = this.createForm.value.docDate;
    const date = new Date(rawDocDate);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);


    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}.${month}.${year}`;

    this.paymentService.editMunisService({
      amount: {...this.createForm.getRawValue().amount, amount: Number(this.createForm.getRawValue().balance.amount) * 100},
      params: this.selectedParams(),
      docDate: formatted,
      docNum: this.createForm.getRawValue().docNum,
      recipientId: this.createForm.getRawValue().recipientId,
      senderAccount: this.choosedAcount().altAcctId,
      description: this.createForm.getRawValue().description
    }, transactionId as string).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.utilsService.spinnerState$$.next(false);
          const amount = this.createForm.getRawValue().balance.amount;
          const amountInCents = Math.round(amount * 100);
          this.matDialog.open(SuccessMunisModalComponent, {
            data: {
              amount: amountInCents,
              transactionId: res.id,
              data: {
                saldo: {
                  amount: amountInCents
                },
                transactionMode: "MUNIS",
                recipient: {
                  name: this.recipientName()
                },
              },
              onDetails: () => {
                this.openDetails()
              }
            },
            disableClose: true,
          }).afterClosed()
            .subscribe((res: any) => {
              // if (res === 'agree') {
              //   this.utilsService.spinnerState$$.next(true);
              //   this.submit()
              // }
            });
        },
        error: error => {
          this.toast.error(error.message);
          this.utilsService.spinnerState$$.next(false);
        }
      })
  }


  submit() {
    this.validateAll();
    const isNeedAutoPay = this.docDate < this.createForm.value.docDate;
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.utilsService.spinnerState$$.next(true);
    const rawDocDate = this.createForm.value.docDate;
    const date = new Date(rawDocDate);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);


    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}.${month}.${year}`;

    const url = `${this.API_URL}/api/account-transaction/v1/payment/check/doc-number?docNumber=${this.createForm.getRawValue().docNum}`;
    this._http.get(url)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.paymentService.prepareMunisService({
              amount: {...this.createForm.getRawValue().amount, amount: Number(this.createForm.getRawValue().balance.amount) * 100},
              params: this.selectedParams(),
              docDate: formatted,
              isAutoPay: isNeedAutoPay,
              docNum: this.createForm.getRawValue().docNum,
              recipientId: this.createForm.getRawValue().recipientId,
              senderAccount: this.choosedAcount().altAcctId,
              description: this.createForm.getRawValue().description,
              ...(isNeedAutoPay
                ? {
                  autoPayCreateReq: {
                    months: [Number(month)],
                    notificationBeforeTime: 'FIVE_MINUTE',
                    days: [],
                    dateEnd: nextDate.toISOString(),
                    paymentTime: '07:00',
                    withNotification: true,
                    paymentDay: Number(day),
                    paymentFrequency: 'MONTHLY'
                  }
                }
                : {})
            }).pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (res) => {
                  if (res) {
                    this.analyticsService.logFirebaseCustomEvent('create_payment_order_success', null);
                    this.analyticsService.logFirebaseCustomEvent('create_payment_order_screen_jump', null);
                    this.analyticsService.logFirebaseCustomEvent('sign_transfer_success', null);

                  }
                  this.utilsService.spinnerState$$.next(false);
                  const amount = this.createForm.getRawValue().balance.amount;
                  const amountInCents = Math.round(amount * 100);
                  this.matDialog.open(SuccessMunisModalComponent, {
                    data: {
                      amount: amountInCents,
                      transactionId: res.id,
                      data: {
                        saldo: {
                          amount: amountInCents
                        },
                        transactionMode: "MUNIS",
                        recipient: {
                          name: this.recipientName()
                        },
                      },
                      onDetails: () => {
                        this.openDetails()
                      }
                    },
                    disableClose: true,
                  }).afterClosed()
                    .subscribe((res: any) => {
                      // if (res === 'agree') {
                      //   this.utilsService.spinnerState$$.next(true);
                      //   this.submit()
                      // }
                    });
                  this.analyticsService.logFirebaseCustomEvent('munis_create_payment_success', {platform: "web"});

                },
                error: error => {
                  this.analyticsService.logFirebaseCustomEvent('payment_failed', {platform: "web"});
                  this.toast.error(error.message);
                  this.utilsService.spinnerState$$.next(false);
                }
              })
          }
          else {
            this.utilsService.spinnerState$$.next(false);
            this.handleDuplicateDocNumber(res.result.message);
          }
        }
      })
  }

  protected readonly Number = Number;
  protected readonly HTMLInputElement = HTMLInputElement;
}
