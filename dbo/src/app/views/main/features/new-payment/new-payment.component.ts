import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';
import { AccountsPaymentsService } from '../accounts-payments/services/accounts-payments.service';
import { AccountsDto } from '../accounts-payments/models/accounts-payments.model';
import { debounceTime, distinctUntilChanged, take, takeUntil } from 'rxjs';
import { AccountComponent } from '../../../../shared/components/account/account.component';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { CurrencyPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { TransactionModes } from '../../../auth/constants/transaction-list.const';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { UtilsService } from '../../../../core/services/utils.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EspSignConfirmComponent } from '../../../../core/components/esp-sign-confirm/esp-sign-confirm.component';
import { EspSignConfirmService } from '../../../../core/services/esp-confirm.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { SaveTransactionComponent } from '../accounts-payments/components/save-transaction/save-transaction.component';
import { LocationBackDirective } from '../../../../shared/directives/location-back.directive';
import { AccountService } from '../../../../core/services/account.service';

@Component({
    selector: 'app-new-payment',
    imports: [
        AccountComponent,
        MatAccordion,
        MatExpansionPanel,
        NgOptimizedImage,
        NgClass,
        MatFormField,
        MatSelectModule,
        NgxMaskPipe,
        MatIcon,
        MatInput,
        CurrencyPipe,
        MatRadioGroup,
        MatRadioButton,
        ReactiveFormsModule,
        FormsModule,
        NgxMaskDirective,
        LocationBackDirective,
    ],
    templateUrl: './new-payment.component.html',
    styles: ``,
    styleUrls: ['./new-payment.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewPaymentComponent implements OnInit {
  accounts!: AccountsDto[];
  selected!: AccountsDto;
  isOpenRequisites = false;
  transactionModes = TransactionModes;

  patterns: any[] = [];
  docNum = '';
  docDate =  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date())
    .replace(/\//g, '.');

  selectedMode: { name: string; value: string } | null = this.transactionModes[0];

  purposes: any[] = [];
  selectedPurpose!: any;
  paymentDescription = '';

  fromQuery = '';

  searchText = new FormControl('');

  signForm: FormGroup = new FormGroup({
    type: new FormControl(106),
    transactionMode: new FormControl(this.transactionModes[0].value),
    saldo: new FormGroup({
      amount: new FormControl('', Validators.required),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    docNum: new FormControl(this.docNum),
    docDate: new FormControl(new Date().toISOString()),
    sender: new FormGroup({
      account: new FormControl(''),
      pinfl: new FormControl(''),
    }),
    recipient: new FormGroup({
      account: new FormControl('', Validators.compose([Validators.minLength(20), Validators.maxLength(27)])),
      // account: new FormControl('', Validators.compose([Validators.minLength(20), Validators.maxLength(27)])),
      codeFilial: new FormControl('', Validators.compose([Validators.minLength(5), Validators.maxLength(5)])),
      tax: new FormControl('', [Validators.minLength(9), Validators.maxLength(9)]),
      name: new FormControl('', Validators.required),
      pinfl: new FormControl(null),
    }),
    purpose: new FormGroup({
      code: new FormControl(null, Validators.required),
      name: new FormControl('', Validators.required),
    }),
    description: new FormControl(this.paymentDescription),
  });

  businessUser!: any;
  selectedAccount!: AccountsDto | null;
  constructor(
    private accountsPaymentService: AccountsPaymentsService,
    private accountsService: AccountService,
    private _cdRef: ChangeDetectorRef,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private router: Router,
    private userService: UserService,
    private espConfirmService: EspSignConfirmService,
    private matDialog: MatDialog,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  destroyRef = inject(DestroyRef);

  selectCode(purpose: any) {
    this.signForm.patchValue({
      purpose: {
        code: purpose.code,
        purposeCode: purpose.code,
        name: purpose.name
      }
    });
  }

  checkQuery() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        this.fromQuery = val['from'];
        if(this.fromQuery === 'pay-templates') {
          this.isFromTemplate();
        }
        if(this.fromQuery === 'repeat-payment') {
          this.isFromRepeat();
        }
      })
  }

  getDocNum() {
    this.accountsPaymentService.getTransactionDocNum()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if(val) {
          this.docNum = val.msg;
          this.signForm.patchValue({
            docNum: val.msg
          })
        }
      })
  }

  submit(type = 'SAVE') {
    if(this.signForm.valid) {
      this.utilsService.spinnerState$$.next(true);
      if(this.selectedMode?.value === 'TRANSACTION') {
        this.checkPaymentAllowed(type);
      } else if (this.selectedMode?.value === 'BUDGET') {
        this.createTransaction();
      }
    }
  }

  selectSenderAccount(account: AccountsDto) {
    this.signForm.patchValue({
      sender: {
        account: account.altAcctId,
        name: account.accountTitle,
      }
    })
  }

  ngOnInit() {
    this.getAccounts();
    this.getPatterns();
    this.getDocNum();
    this.initWatchers();
    this.getBusinessUserInfo();
    this.checkQuery();
  }

  initWatchers() {
    this.watchBankMfo();
    this.watchPurposeChange();
  }

  watchBankMfo() {
    this.signForm.get('recipient.codeFilial')?.valueChanges
      .pipe(
        debounceTime(600),
        distinctUntilChanged()
      )
      .subscribe(value => {
        if(value) {
          this.getBankInfo(value);
        }
      });
  }

  getBankInfo(bankMfo: string) {
    if (bankMfo) {
      this.accountsPaymentService.getBankInfo(bankMfo)
        .pipe(
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(val => {
          if (val) {
            this.checkForAnor(val);
            this.setBankName(val);
          }
        })
    }
  }

  getBusinessUserInfo() {
    this.userService.userInfo$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
      this.businessUser = res?.business;
    });
  }

  setBankName(val: any) {
    this.signForm.patchValue({
      recipient: {
        pinfl: val.nameRu,
        tax: val.inn
      }
    });
  }

  checkForAnor(val: any) {
    if(!val.isSelf) {
      this.signForm.patchValue({
        type: 306
      })
    }
  }

  watchPurposeChange() {
    this.searchText.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    )
      .subscribe(val => {
        this.getPurpose();
      })
  }

  selectMode(mode: { name: string; value: string }, type = 'DEFAULT'): void {
    if (this.selectedMode?.value === mode.value) return;
    this.selectedMode = mode;
    this.signForm.patchValue({
      sender: {
        account: '',
        pinfl: null,
      }
    });
    if(this.fromQuery === 'templates' || this.fromQuery === 'repeat-payment') {
      return;
    }
    if(type === 'DEFAULT') {
      this.getAccounts();
      this.selectedAccount = null;
    }
  }

  getPatterns(paging = {page: 0, size: 10}) {
    const transactionModes = null;
      this.accountsPaymentService.getTransactionList(paging,
      {
        startDate: null,
        endDate: null,
        transactionModes,
        statuses: ['SAVED'],
      }).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
      if (!res) return
      this.patterns = res.content;
    })
  }

  checkPaymentAllowed(type = 'SAVE') {
    const form = this.signForm.getRawValue();
    const data = {
      senderAccount: form.sender.account,
      recipientAccount: form.recipient.account,
      transactionMode: this.selectedMode?.value as string
    }
    this.accountsPaymentService.checkPaymentAllowed(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if(val) {
          this.createTransaction(type);
        }
      })
  }

  createTransaction(type = 'SAVE') {
    const body = this.signForm.getRawValue();
    body.saldo.amount = Math.round(this.signForm.getRawValue().saldo.amount * 100);
    body.transactionMode = this.selectedMode?.value;
    this.utilsService.spinnerState$$.next(true);
    this.accountsPaymentService.prepareUzsTransaction(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            if(type === 'SAVE') {
              if(this.fromQuery === 'templates') {
                if (res.id) {
                  let dialog = this.matDialog.open(SaveTransactionComponent, {
                    disableClose: true,
                    data: res.id
                  })
                  dialog.componentInstance.save
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe(() => {
                    dialog.close();
                    this.accountsPaymentService.deletePreparedTransaction(res.id)
                      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((val) => {
                        this.router.navigate([`/${this.fromQuery}`]);
                    });
                  })
                }
              } else {
                this.toastrService.success('Транзакция создана!');
                this.signForm.reset();
                this._cdRef.detectChanges();
                this.router.navigate(['account-payment']);
              }
            }
          }
          if (type === 'SEND') {

            this.espConfirmService.paymentSign({
              type: 'TRANSACTION',
              id: res!.id,
              hash: ''
            }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res1) => {
              if (!res1) return
              this.matDialog.open(EspSignConfirmComponent, {
                width: '744px',
                data: {action: {...res1, type: 'TRANSACTION'}, transaction: {}},
              });
            })

          }
        }
      });
  }

  getPurpose() {
    this.accountsPaymentService.getPurposes({
      page: 0,
      size: 10,
      searchText: this.searchText.value as string,
    })
      .pipe(take(1))
      .subscribe(val => {
        if(val) {
          this.purposes = val;
          this._cdRef.detectChanges();
          // this.selectedPurpose = val[0];
        }
      })
  }

  getAccounts() {
    this.accountsPaymentService.getPaymentAllowed({
      page: 0,
      size: 10,
    },{
      senderAccount: null,
      transactionMode: this.selectedMode?.value as string
    }).pipe(take(1))
      .subscribe((val) => {
        if(val) {
          if(val && Array.isArray(val.content)) {
            this.accounts = val.content as AccountsDto[];
            this.selected = val.content[0];
            this.updateSelectedAccount();
            this._cdRef.detectChanges();
          }
        }
      })
  }

  updateSelectedAccount() {
    if(this.fromQuery === 'pay-templates') {
      const template = sessionStorage.getItem('template');
      if(template) {
        const value = JSON.parse(template);
        this.selectedAccount = this.accounts?.find(el => el.altAcctId === value.sender.account) as AccountsDto;
      }
    }
    if(this.fromQuery === 'repeat-payment') {
      const repeatPayment = sessionStorage.getItem('repeat-payment');
      if(repeatPayment) {
        const value = JSON.parse(repeatPayment);
        this.selectedAccount = this.accounts?.find(el => el.altAcctId === value.sender.account) as AccountsDto;
      }
    }
  }

  amount: number = 0;
  formattedAmount: string = '0 Сум';

  formatAmount(): void {
    this.formattedAmount = `${this.amount.toLocaleString('ru-RU', { minimumFractionDigits: 0 })} Сум`;
  }

  showPattern(value: any) {
    const mode = this.transactionModes.find(el => el.value === value.transactionMode) as { name: string; value: string; };
    this.selectMode(mode, 'PATTERN');
    const acc = this.accounts?.find(el => el.altAcctId === value.sender.account) as AccountsDto;
    if(acc) {
      this.selectedAccount = acc;
    }
    this.signForm.patchValue({
      ...value,
      saldo: {
        ...value.senderAmount,
        amount: value.senderAmount.amount / 100
      }
    });
    this.addAndSelectNewPurpose(value.purpose);
    this._cdRef.detectChanges();
  }

  isFromTemplate() {
    const template = sessionStorage.getItem('template');
    if(template) {
      const transaction = JSON.parse(template)
      this.showPattern(transaction);
    }
  }

  isFromRepeat() {
    const repeatPayment = sessionStorage.getItem('repeat-payment');
    if(repeatPayment) {
      const transaction = JSON.parse(repeatPayment);
      this.repeatRequestBody(transaction);
    }
  }

  getAccountInfo(account: string) {
    this.accountsService.getAccountInfo(account)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.selectSenderAccount(res as  any);
            // this.selectedAccount = res;
            // this.accounts = [res, ...this.accounts];
            this._cdRef.detectChanges();
          }
        }
      })
  }

  repeatRequestBody(value: any) {
    const mode = this.transactionModes.find(el => el.value === value.transactionMode) as { name: string; value: string; };
    this.selectMode(mode, 'repeat');
    this.getAccountInfo(value.sender.account);
    this.signForm.patchValue({
      ...value,
      saldo: {
        ...value.senderAmount,
        amount: value.senderAmount.amount / 100
      }
    });
    this.addAndSelectNewPurpose(value.purpose);
    this._cdRef.detectChanges();
  }

  addAndSelectNewPurpose(newPurpose: any) {
    this.purposes = [...this.purposes, newPurpose];
    this.selectedPurpose = newPurpose;
    this.signForm.patchValue({
      purpose: {
        code: newPurpose.code,
        purposeCode: newPurpose.code,
        name: newPurpose.name,
      }
    });
  }


  toggleRequisites() {
    this.isOpenRequisites = !this.isOpenRequisites;
  }

  protected readonly Number = Number;
}
