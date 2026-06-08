import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef, EventEmitter,
  Input,
  OnChanges,
  OnInit, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { TransactionModes } from '../../../../../auth/constants/transaction-list.const';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { debounceTime, distinctUntilChanged, take } from 'rxjs';
import { AmountService } from '../../../../../../core/services/amount.service';
import {
  SearchableSelectComponent
} from '../../../../../../shared/components/searchable-select/searchable-select.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { VatComponent } from '../vat/vat.component';
import { MoreActionsComponent } from '../more-actions/more-actions.component';
import { NgxMaskDirective } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../../../../../core/services/account.service';
import { TransactionOneDetailDto } from '../../../../../../core/models/transaction.models';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchableComponent } from '../../../../../../core/components/searchable/searchable.component';
import { LocationBackDirective } from '../../../../../../shared/directives/location-back.directive';
import { MatDialog } from '@angular/material/dialog';
import { TemplateNameComponent } from '../../../template-transactions/components/template-name/template-name.component';
import { AutoPayForm } from '../../../create-autopay/interfaces/auto-pay.interface';
import { AutopayService } from '../../../../../../core/services/autopay.service';

@Component({
    selector: 'app-transaction-form',
    imports: [
        FormsModule,
        MatFormField,
        MatInput,
        MatLabel,
        MatSuffix,
        ReactiveFormsModule,
        NgClass,
        SearchableSelectComponent,
        VatComponent,
        NgxMaskDirective,
        MatError,
        NgIf,
        LocationBackDirective
    ],
    templateUrl: './transaction-form.component.html',
    styles: ``,
    styleUrls: ['./transaction-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFormComponent implements OnInit, OnChanges {
  @Input() docNum!: string;
  @Input() docDate!: string;
  @Input() selectedAccount!: any;
  @Input() fromQuery = '';
  @Input() toQuery = ''
  @Output() senderAccountTouched = new EventEmitter<boolean>();

  @Input() editPayment!: any;
  @Input() repeatPayment!: any;
  templateName = '';

  tempAccount = '';

  templateLoaded = false;
  @Input() autoPay = false;
  @Input() autoPayForm!: AutoPayForm;

  paymentDescription = '';
  amountInWords = '';
  accounts: any[] = [];
  purposes: any[] = [];
  receiverAccounts: any[] = [];
  isFocused = false;

  purposePage = 0;
  purposeSize = 20;
  searchPurposeText = '';

  signForm: FormGroup = new FormGroup({
    transactionMode: new FormControl('TRANSACTION'),
    windowType: new FormControl('TRANSACTION'),
    saldo: new FormGroup({
      amount: new FormControl('', Validators.required),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    docNum: new FormControl(this.docNum),
    docDate: new FormControl(''),
    sender: new FormGroup({
      account: new FormControl('', Validators.required),
      pinfl: new FormControl(null),
    }),
    recipient: new FormGroup({
      account: new FormControl('', [Validators.minLength(20), Validators.maxLength(27), Validators.required]),
      codeFilial: new FormControl('', [Validators.minLength(5), Validators.maxLength(5), Validators.required]),
      tax: new FormControl('', [Validators.minLength(9), Validators.maxLength(9), Validators.required]),
      name: new FormControl('', Validators.required),
      bankName: new FormControl('', Validators.required),
      pinfl: new FormControl(null),
    }),
    purpose: new FormControl('', Validators.required),
    description: new FormControl(this.paymentDescription),
  });

  constructor(
    private amountsService: AmountService,
    private paymentService: PaymentService,
    private accountsPaymentService: AccountsPaymentsService,
    private accountService: AccountService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private activatedRoute: ActivatedRoute,
    private matDialog: MatDialog,
    private router: Router,
    private autoPayService: AutopayService,
  ) {
  }

  ngOnInit() {
    this.watchBankCode();
    this.watchAccount();
    this.watchTemplate();
    if(this.editPayment) {
      this.updateForm(this.editPayment);
    }
  }

  watchTemplate() {
    this.activatedRoute.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const from = res.get('from')
          if(from === 'add-template') {
            const template = sessionStorage.getItem('template') as any;
            const transaction = JSON.parse(template) as TransactionOneDetailDto;
            this.updateForm(transaction);
          }
        }
      })
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
      }
    });
    this.templateLoaded = true;
    this.convertAmountIntoWords();
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
    if (changes['editPayment'] && changes['editPayment'].currentValue) {
      this.updateForm(this.editPayment);
    }
  }

  getReceiverAccount(account?: string | null) {
    if(!account || account?.length === 20 || this.tempAccount) {
      const branchCode = this.signForm.getRawValue().recipient.codeFilial;
      this.paymentService.getAccountReference({
        page: 0,
        size: 20,
        account: account || this.tempAccount || null,
        branchCode: branchCode.length === 5 ? branchCode : null
      }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        if (!res || !res.content.length) return;
        this.receiverAccounts = res.content;
        const acc = res.content[0];
        if(account?.length === 20 && acc) {
          this.setReceiverAccount(acc);
        }
        this._cdRef.markForCheck();
      });
    }

  }

  setReceiverAccount(event: any) {
    if(event.recipientAccountNumber) {
      this.tempAccount = event.recipientAccountNumber;
      this.signForm.patchValue({
        recipient: {
          account: event.recipientAccountNumber,
          tex: event.inn,
          name: event.recipientName,
        }
      });
    }
  }

  setSenderAccount(senderAccount: any) {
    this.signForm.patchValue({
      sender: {
        account: senderAccount.altAcctId,
      }
    });
  }

  watchBankCode() {
    this.signForm.get('recipient.codeFilial')?.valueChanges
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        if(value) {
          this.getBankInfo(value);
        }
      });
  }
  watchAccount() {
    this.signForm.get('recipient.account')?.valueChanges
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        if(value?.length === 20) {
          this.getAccountInfo(value);
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

  getAccountInfo(accountNumber: string) {
    if(!this.templateLoaded) {
      const branchCode = this.signForm.getRawValue().recipient.codeFilial;
      this.paymentService.getAccountReference({
        page: 0,
        size: 20,
        account: accountNumber,
        branchCode: branchCode.length === 5 ? branchCode : null,
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            if(res?.content?.length) {
              const acc = res?.content[0];
              if(acc.inn) {
                this.signForm.patchValue({
                  recipient: {
                    tax: acc.inn,
                  }
                });
              }
              if(acc?.recipientName) {
                this.signForm.patchValue({
                  recipient: {
                    name: acc.recipientName,
                  }
                });
              }
              this._cdRef.markForCheck();
            }
          }
        })
    }
    this.templateLoaded = false;
  }

  setBankName(val: any) {
    this.signForm.patchValue({
      recipient: {
        bankName: val.bankBranchName,
      }
    });
    this._cdRef.markForCheck();
  }

  vatSelected(value: string) {
    const description = this.signForm.getRawValue().description;
    let newDescription = description.replace('НДС 0%', '').trim();
    newDescription = newDescription.replace('НДС 10%', '').trim();
    newDescription = newDescription.replace('НДС 15%', '').trim();
    newDescription = newDescription.replace('НДС 20%', '').trim();

    this.signForm.patchValue({
      description: `${newDescription} ${value}`.trim()
    })
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
    this.paymentService.getPurposes(
      {
        page: this.purposePage,
        size: this.purposeSize,
        searchText: this.searchPurposeText,
      }
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
      .subscribe({
        next: val => {
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
        },
        error: (err: any) => {
          this.toastrService.error(err.message);
        }
      })
  }

  editTransaction(type = 'SAVE') {
    this.accountsPaymentService.deletePreparedTransaction(this.editPayment.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            if(this.templateName.length > 0) {
              const body = this.signForm.getRawValue();
              body.sender.account = this.selectedAccount?.altAcctId;
              body.saldo.amount = Math.round(this.signForm.getRawValue().saldo.amount * 100);
              delete body.purpose.purposeType;
              body.purpose.code = body.purpose.code.trim();

            } else {
              this.createTransaction(type);
            }
          }
        }
      });
  }

  editAutoPay() {
    this.autoPayService.deleteAutoPay(this.autoPayForm.id || 0)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            delete this.autoPayForm.id;
            this.createTransaction();
          }
        }
      });
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

    if(type === 'templates') {
      this.fromQuery = 'templates';
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

  getInvalidFields(formGroup: FormGroup): string[] {
    const invalidFields: string[] = [];

    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.controls[key];

      if (control instanceof FormGroup) {
        const nestedInvalidFields = this.getInvalidFields(control);
        invalidFields.push(...nestedInvalidFields.map((field) => `${key}.${field}`));
      } else if (control.invalid && control.touched) {
        invalidFields.push(key);
      }
    });

    return invalidFields;
  }


  submit(type = 'SAVE') {
    this.signForm.markAllAsTouched();
    this.checkTouchedSender();
    if(this.signForm.valid) {
      this.checkPaymentAllowed(type);
    }
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

  cancel() {
  }

  checkTouchedSender() {
    const invalid = this.signForm.get('sender.account')?.invalid;
    const touched = this.signForm.get('sender.account')?.touched;
    const res = Boolean(invalid && touched);
    this.senderAccountTouched.emit(res);
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
