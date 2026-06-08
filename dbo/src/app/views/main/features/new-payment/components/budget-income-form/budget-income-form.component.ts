import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef, EventEmitter,
  Input,
  OnChanges, OnInit, Output,
  SimpleChanges
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatFormFieldModule, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  SearchableSelectComponent
} from '../../../../../../shared/components/searchable-select/searchable-select.component';
import { AmountService } from '../../../../../../core/services/amount.service';
import { PaymentService, PurposeTypes } from '../../../../../../core/services/payment.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TransactionModes } from '../../../../../auth/constants/transaction-list.const';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { MoreActionsComponent } from '../more-actions/more-actions.component';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import {BudgetReferenceContentDto} from "../../../accounts-payments/models/accounts-payments.model";
import { TransactionOneDetailDto } from '../../../../../../core/models/transaction.models';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LocationBackDirective } from '../../../../../../shared/directives/location-back.directive';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { MatDialog } from '@angular/material/dialog';
import { TemplateNameComponent } from '../../../template-transactions/components/template-name/template-name.component';
import { AutoPayForm } from '../../../create-autopay/interfaces/auto-pay.interface';

@Component({
    selector: 'app-budget-income-form',
    imports: [
        FormsModule,
        MatFormField,
        MatFormFieldModule,
        MatInput,
        MatLabel,
        MatSuffix,
        ReactiveFormsModule,
        SearchableSelectComponent,
        MoreActionsComponent,
        NgOptimizedImage,
        NgxMaskDirective,
        MatError,
        NgIf,
        NgClass,
        LocationBackDirective,
    ],
    templateUrl: './budget-income-form.component.html',
    styles: ``,
    styleUrls: ['./budget-income-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetIncomeFormComponent implements OnInit, OnChanges {
  @Input() docNum!: string;
  @Input() docDate!: string;
  @Input() selectedAccount!: any;
  @Input() fromQuery = '';
  @Input() toQuery = '';
  @Output() senderAccountTouched = new EventEmitter<boolean>();

  @Input() editPayment!: any;
  templateName = '';

  templateLoaded = false;
  @Input() autoPay = false;
  @Input() autoPayForm!: AutoPayForm;

  paymentDescription = '';
  amountInWords = '';
  accounts: any[] = [];
  purposes: any[] = [];

  purposePage = 0;
  purposeSize = 20;
  searchPurposeText = '';

  signForm: FormGroup = new FormGroup({
    transactionMode: new FormControl('BUDGET'),
    windowType: new FormControl('BUDGET_INCOME'),
    saldo: new FormGroup({
      amount: new FormControl('', Validators.required),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    docNum: new FormControl(this.docNum),
    docDate: new FormControl(this.docDate),
    sender: new FormGroup({
      account: new FormControl('', Validators.required),
      pinfl: new FormControl(''),
    }),
    recipient: new FormGroup({
      account: new FormControl('', [Validators.minLength(25), Validators.maxLength(25), Validators.required]),
      codeFilial: new FormControl(''),
      tax: new FormControl('', ),
      name: new FormControl('', Validators.required),
      bankName: new FormControl(null),
      pinfl: new FormControl(null),
      regionCode: new FormControl(null),
      soatoCode: new FormControl(null),
      regionName: new FormControl(null),
      districtName: new FormControl(null),
    }),
    purpose: new FormControl(''),
    description: new FormControl(this.paymentDescription),
  });

  constructor(
    private amountsService: AmountService,
    private paymentService: PaymentService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private accountsPaymentService: AccountsPaymentsService,
    private utilsService: UtilsService,
    private activatedRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private matDialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.watchTemplate();
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
      }
    });
    this.templateLoaded = true;
    this.convertAmountIntoWords();
  }

  watchTemplate() {
    this.activatedRoute.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const from = res.get('from')
          if(from === 'add-template') {
            this.initForm();
          }
        }
      })
  }

  initForm() {
    if(this.fromQuery === 'add-template') {
      const template = sessionStorage.getItem('template') as any;
      const transaction = JSON.parse(template) as TransactionOneDetailDto;
      if(transaction) {
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
    if (changes['editPayment'] && changes['editPayment'].currentValue) {
      this.updateForm(this.editPayment);
    }
  }

  setSenderAccount(senderAccount: any) {
    if(senderAccount) {
      this.signForm.patchValue({
        sender: {
          account: senderAccount.altAcctId,
        }
      });
    }
  }
  getReferences(event:Event){
    const inputElement = event.target as HTMLInputElement;
    const accountValue = inputElement.value;
    if (accountValue.length < 25) {
      this.resetRecipientForm();
      return;
    }
    if (accountValue.length === 25){
      this.getAccountReferences(accountValue);
    }
  }
  resetRecipientForm() {
    this.signForm.patchValue({
      recipient: {
        name: null,
        soatoCode: null,
        regionName: null,
        regionCode: null,
        districtName: null,
      }
    });
  }
  getAccountReferences(account: string) {
    this.paymentService.getAccountReference({
      page: 0,
      size: 20,
      account: account
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (!res || !res.content) return;
      const foundReference = res.content.find(item => item.recipientAccountNumber === account);
      if (foundReference) {
        this.processFoundReference(foundReference);
      } else {
        this.processFoundReference({} as BudgetReferenceContentDto);
      }
      this._cdRef.markForCheck();
    });
  }
  processFoundReference(data: BudgetReferenceContentDto) {
    this.signForm.patchValue({
      recipient: {
        name: data?.recipientName,
        soatoCode: data?.soatoDistrictCode,
        regionName: data?.soatoDetail?.regionName,
        regionCode: data?.soatoDetail?.regionCode,
        districtName: data?.soatoDetail?.districtName,
      }
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
      },
      PurposeTypes.BUDGET_INCOME
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
              if(this.toQuery === 'edit-template') {
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
        error: (err) => {
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

    body.docDate = this.docDate;
    delete body.recipient.regionCode;
    delete body.recipient.soatoCode;
    delete body.recipient.regionName;
    delete body.recipient.districtName;

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

  checkTouchedSender() {
    const invalid = this.signForm.get('sender.account')?.invalid;
    const touched = this.signForm.get('sender.account')?.touched;
    const res = Boolean(invalid && touched);
    this.senderAccountTouched.emit(res);
  }
  submit(type = 'SAVE') {
    this.signForm.markAllAsTouched();
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
