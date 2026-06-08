import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef, EventEmitter,
  Input,
  OnChanges,
  OnInit, Output,
  SimpleChanges
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  SearchableSelectComponent
} from '../../../../../../shared/components/searchable-select/searchable-select.component';
import { AmountService } from '../../../../../../core/services/amount.service';
import { AccountService } from '../../../../../../core/services/account.service';
import { PaymentService, PurposeTypes } from '../../../../../../core/services/payment.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TransactionModes } from '../../../../../auth/constants/transaction-list.const';
import { AccountSelectComponent } from '../../../../../../shared/components/account-select/account-select.component';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MoreActionsComponent } from '../more-actions/more-actions.component';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { LocationBackDirective } from '../../../../../../shared/directives/location-back.directive';
import { AccountsDto } from '../../../accounts-payments/models/accounts-payments.model';
import { MatDialog } from '@angular/material/dialog';
import { TemplateNameComponent } from '../../../template-transactions/components/template-name/template-name.component';
import { AutoPayForm } from '../../../create-autopay/interfaces/auto-pay.interface';
import { AutopayService } from '../../../../../../core/services/autopay.service';
import { Pageable } from '../../../../../../shared/interfaces/pageable.interface';

@Component({
    selector: 'app-between-accounts-form',
    imports: [
        FormsModule,
        MatFormField,
        MatInput,
        MatLabel,
        MatSuffix,
        ReactiveFormsModule,
        SearchableSelectComponent,
        AccountSelectComponent,
        MoreActionsComponent,
        NgOptimizedImage,
        NgxMaskDirective,
        NgClass,
        MatError,
        NgIf,
        LocationBackDirective
    ],
    templateUrl: './between-accounts-form.component.html',
    styles: ``,
    styleUrls: ['./between-accounts-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BetweenAccountsFormComponent implements OnInit, OnChanges {
  @Input() docNum!: string;
  @Input() docDate!: string;
  @Input() selectedAccount!: any;
  @Input() fromQuery = '';
  @Input() toQuery = '';
  @Input() businessUser!: any;


  preSelected!: AccountsDto;

  @Output() senderAccountTouched = new EventEmitter<boolean>();

  @Input() editPayment!: any;
  templateName = '';

  receiverAccountTouched = false;

  @Input() autoPay = false;
  @Input() autoPayForm!: AutoPayForm;

  paymentDescription = '';
  amountInWords = '';
  accounts: any[] = [];
  pageableAccounts!: Pageable<AccountsDto>;
  purposes: any[] = [];

  accountSearching = false;

  purposePage = 0;
  purposeSize = 20;
  searchPurposeText = '';

  signForm: FormGroup = new FormGroup({
    transactionMode: new FormControl('TRANSACTION'),
    windowType: new FormControl('BETWEEN_ACCOUNTS'),
    saldo: new FormGroup({
      amount: new FormControl('', Validators.required),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    docNum: new FormControl(this.docNum),
    docDate: new FormControl(new Date().toISOString()),
    sender: new FormGroup({
      account: new FormControl('', Validators.required),
      pinfl: new FormControl(''),
    }),
    recipient: new FormGroup({
      account: new FormControl('', [Validators.minLength(20), Validators.maxLength(27), Validators.required]),
      codeFilial: new FormControl(''),
      tax: new FormControl('01095'),
      name: new FormControl(''),
      pinfl: new FormControl(null),
    }),
    purpose: new FormControl('', Validators.required),
    description: new FormControl(this.paymentDescription),
  });

  constructor(
    private amountsService: AmountService,
    private accountService: AccountService,
    private paymentService: PaymentService,
    private accountsPaymentService: AccountsPaymentsService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private utilsService: UtilsService,
    private matDialog: MatDialog,
    private autoPayService: AutopayService
  ) {
  }

  ngOnInit() {
    this.watchBankCode();
    if(this.editPayment) {
      this.updateForm(this.editPayment);
    }
  }

  updateForm(transaction: any) {
    if(!transaction) return;

    if(transaction.status === 'SAVED') {
      this.templateName = transaction.name;
    }

    this.signForm.patchValue({
      ...transaction,
      saldo: {
        amount: (transaction.senderAmount.amount / 100),
        currency: transaction.senderAmount.currency
      },
      recipient: {
        ...transaction.recipient,
      },
      docNum: this.docNum,
      docDate: this.docDate,
    });
    this.convertAmountIntoWords();
  }

  preSelect() {
    const account = this.accounts.find((el) => {
      if(this.editPayment.recipient.account && el.altAcctId === this.editPayment.recipient.account) {
        return true;
      }
      return false;
    });
    if(account) {
      this.preSelected = account;
      this._cdRef.markForCheck();
    }
  }

  onPagination(data: {search: string; page: number}) {
    this.getReceiverAccount(data.search, data.page, true);
  }

  onSearch(search = '', page = 0) {
    this.accounts = [];
    this.getReceiverAccount(search, page);
  }

  getReceiverAccount(search = '', page = 0, pagination = false) {
    this.accountSearching = true;
    if(this.selectedAccount?.altAcctId) {
      this.accountService.getPaymentAllowed({
        page: page,
        size: 20
      },{
        senderAccount: this.selectedAccount?.altAcctId || null,
        transactionMode: 'TRANSACTION',
        accountType: 'TERM_DEPOSIT',
        search
      }).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res: any) => {
            if(!res) return;
            this.pageableAccounts = res;
            if(pagination) {
              this.accounts.push(...res.content);
            } else {
              this.accounts = res.content;
            }
            if(res.account?.length || this.pageableAccounts?.content?.length) {
              this.preSelect();
            }
            this.accountSearching = false;
            this._cdRef.detectChanges();
          },
          error: (err) => {
            this.accountSearching = false;
            this._cdRef.detectChanges();
          },
          complete: () => {
            this.accountSearching = false;
            this._cdRef.detectChanges();
          }
        })
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedAccount'] && changes['selectedAccount'].currentValue !== undefined) {
      this.setSenderAccount(changes['selectedAccount'].currentValue);
    }
    if (changes['docNum'] && changes['docNum'].currentValue !== undefined) {
      this.signForm.patchValue({
        docNum: changes['docNum'].currentValue
      });
    }
    if (changes['docDate'] && changes['docDate'].currentValue !== undefined) {
      this.signForm.patchValue({
        docDate: changes['docDate'].currentValue
      });
    }
    if (changes['businessUser'] && changes['businessUser'].currentValue !== undefined) {
      this.signForm.patchValue({
        recipient: {
          tax: changes['businessUser'].currentValue.inn,
          codeFilial: changes['businessUser'].currentValue.mfo || '01095',
        }
      });
    }
    if (changes['editPayment'] && changes['editPayment'].currentValue) {
      this.updateForm(this.editPayment);
    }
  }

  setFormFields(selectedAccount: any) {
    this.signForm.patchValue({
      recipient: {
        account: selectedAccount.altAcctId,
        name: selectedAccount.accountTitle,
      }
    })
  }

  checkTouchedReceiver() {
    this.receiverAccountTouched = Boolean(this.signForm.get('recipient.account')?.invalid && this.signForm.get('recipient.account')?.touched);
  }

  checkTouchedSender() {
    const touched = Boolean(this.signForm.get('sender.account')?.invalid && this.signForm.get('sender.account')?.touched);
    this.senderAccountTouched.emit(touched);
  }


  setSenderAccount(senderAccount: any) {
    this.signForm.patchValue({
      sender: {
        account: senderAccount?.altAcctId,
      }
    });
    this.getReceiverAccount();
  }

  getAccount(account: string) {
    this.accountService.getAccountInfo(account)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.selectedAccount = {
              ...res,
              altAcctId:  res?.accountNumberCard
            };
          }
        }
      })
  }

  watchBankCode() {
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
            this.setBankName(val);
          }
        })
    }
  }

  setBankName(val: any) {
    this.signForm.patchValue({
      recipient: {
        bankName: val.nameRu,
        tax: val.inn
      }
    });
  }


  displayOption(option: any){
    if(option) {
      return `${option.code} - ${option.name}`;
    }
    return '';
  }

  scrollPurpose() {
    if(this.purposes.length < this.purposeSize) {
      return;
    }
    this.purposePage++;
    this.getPurposes();
  }

  searchPurpose(searchText : string) {
    this.searchPurposeText = searchText;
    this.purposePage = 0;
    this.getPurposes();
  }

  getPurposes() {
    let purposeType: PurposeTypes = PurposeTypes.PAYMENT_CURRENCY;
    if(this.selectedAccount.balance.currency === 'UZS') {
      purposeType = PurposeTypes.PAYMENT_UZS;
    }
    this.paymentService.getPurposes(
      {
        page: this.purposePage,
        size: this.purposeSize,
        searchText: this.searchPurposeText,
      },
      purposeType
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ((res) => {
          const content = res?.content
          if(content && Array.isArray(content)) {

            this.purposePage = res.number;
            if(this.purposePage === 0) {
              this.purposes = content;
            } else {
              this.purposes = [...this.purposes, ...content];
            }
          }
        }),
        complete:() => {
          this._cdRef.markForCheck();
        }
      })
  }

  convertAmountIntoWords() {
    const amount = this.signForm.getRawValue().saldo.amount;
    if(amount) {
      this.amountInWords = this.amountsService.numberToWordsRU(amount);
    } else {
      this.amountInWords = '';
    }
  }

  checkPaymentAllowed(type = 'SAVE') {
    const form = this.signForm.getRawValue();
    const data = {
      senderAccount: form.sender.account,
      recipientAccount: form.recipient.account,
      transactionMode: this.signForm.value.transactionMode
    }
    this.accountsPaymentService.checkPaymentAllowed(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if(val) {
          if(type == 'EDIT') {
            if (this.autoPay) {
              this.editAutoPay();
            } else if(this.toQuery === 'edit-template') {
              this.editTemplate();
            } else if(this.editPayment?.status === 'REVERTED') {
              this.createTransaction();
            } else {
              this.editTransaction();
            }
          } else {
            this.createTransaction(type);
          }
        }
      })
  }

  createTemplate() {
    this.matDialog.open(TemplateNameComponent, {
      data: {
        title: 'Введите название шаблона',
      }
    }).afterClosed().subscribe({
      next: (name: string) => {
        if(name) {

          const body = this.signForm.getRawValue();
          body.sender.account = this.selectedAccount?.altAcctId;
          body.saldo.amount = Math.round(this.signForm.getRawValue().saldo.amount * 100);
          delete body.purpose.purposeType;
          body.purpose.code = body.purpose.code.trim();

          this.paymentService.createTemplate(body, name);
        }
      }
    })
  }

  editTransaction(type = 'SAVE') {
    this.accountsPaymentService.deletePreparedTransaction(this.editPayment.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.createTransaction(type);
          }
        }
      })
  }

  createTransaction(type = 'SAVE') {
    let t = type;
    let fromQuery = '';
    if(type === 'templates') {
      fromQuery = type;
      t = 'SAVE';
    }
    const body = this.signForm.getRawValue();
    body.sender.account = this.selectedAccount?.altAcctId;
    body.saldo.amount = Math.round(this.signForm.getRawValue().saldo.amount * 100);
    delete body.purpose.purposeType;
    body.purpose.code = body.purpose.code.trim();

    if(this.editPayment?.status === 'REVERTED') {
      body.id = this.editPayment.id;
    }

    if(this.autoPay) {
      this.fromQuery = 'autopay';
      fromQuery = 'autopay';
      body.autoPayCreateReq = this.autoPayForm;
      if(this.autoPayForm.name) {
        body.name = this.autoPayForm.name;
      } else {
        body.name = `Автоплатёж ${body.docNum}`;
      }
      body.isAutoPay = true;
      delete body.autoPayCreateReq.name;
    }

    this.utilsService.spinnerState$$.next(true);
    this.paymentService.createTransaction(body, t, fromQuery);
  }

  editAutoPay() {
    this.autoPayService.deleteAutoPay(this.editPayment.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.createTransaction();
          }
        }
      });
  }

  editTemplate() {
    this.matDialog.open(TemplateNameComponent, {
      data: {
        title: 'Введите название шаблона',
        name: this.editPayment.name,
      }
    }).afterClosed().subscribe({
      next: (name: string) => {
        if(name) {

          const body = this.signForm.getRawValue();
          body.sender.account = this.selectedAccount?.altAcctId;
          body.saldo.amount = Math.round(this.signForm.getRawValue().saldo.amount * 100);
          delete body.purpose.purposeType;
          body.purpose.code = body.purpose.code.trim();

          this.accountsPaymentService.deleteSavedPayment(this.editPayment.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (res) => {
                if(res) {
                  this.paymentService.createTemplate(body, name);
                }
              }
            });
        }
      }
    })
  }


  submit(type = 'SAVE') {
    this.signForm.markAllAsTouched();
    this.checkTouchedReceiver();
    this.checkTouchedSender();
    if(this.signForm.valid) {
      this.checkPaymentAllowed(type);
    }
  }

  selectAction(action: any) {
    if(action.value === 'create') {
      this.submit();
    } else if(action.value === 'send') {
      this.submit('SEND');
    }
  }

  protected readonly transactionModes = TransactionModes;
  protected readonly Number = Number;

}
