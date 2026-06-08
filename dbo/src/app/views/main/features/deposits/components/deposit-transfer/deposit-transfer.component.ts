import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animate, style, transition, trigger } from '@angular/animations';
import { firstValueFrom, take } from 'rxjs';
import { SpinnerComponent } from '../../../../../../core/components/spinner/spinner.component';
import { AmountService } from '../../../../../../core/services/amount.service';
import { AccountService } from '../../../../../../core/services/account.service';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { ToastrService } from 'ngx-toastr';

export interface Balance {
  amount: number;
  scale: number;
  currency: string;
  logo: string | null;
}

export interface Account {
  id: string;
  accountTitle: string;
  accountType: string;
  altAcctId: string;
  balance: Balance;
  isTransactionAllowed: boolean;
  openDate: string;
  saldoUnlead: number | null;
  status: string;
}

@Component({
  selector: 'app-deposit-transfer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    NgxMaskDirective,
    NgxMaskPipe,
    TranslateModule,
    SpinnerComponent,
  ],
  templateUrl: './deposit-transfer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  ],
})
export class DepositTransferComponent implements OnInit {
  // UI state
  isTemplateOpen = false;
  openSenderAccount = false;
  openRecipientAccount = false;
  templateCreateModal = false;
  templateName = '';
  templateError = false;
  amountInWords = '';
  balanceErrorOver = '';

  // Data
  senderAccounts: any[] = [];
  recipientAccounts: any[] = [];
  businessInfo: any = {};

  // Signals
  choosedSenderAccount = signal<Account | Record<string, any>>({});
  choosedRecipientAccount = signal<Account | Record<string, any>>({});
  spinnerState = signal<boolean>(false);
  minDate = signal<any>('');
  templateList = signal<any[]>([]);

  depositForm: FormGroup = new FormGroup({
    docNum: new FormControl(''),
    docDate: new FormControl(null, Validators.required),
    balance: new FormGroup({
      amount: new FormControl(null, [Validators.required, Validators.min(0.01)]),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    purposeCode: new FormControl('', Validators.required),
    description: new FormControl('', [Validators.required, Validators.maxLength(450)]),
    sender: new FormGroup({
      account: new FormControl('', Validators.required),
    }),
    recipient: new FormGroup({
      account: new FormControl('', Validators.required),
    }),
    isSaved: new FormControl(false),
    name: new FormControl(''),
    templateId: new FormControl(null),
  });

  constructor(
    private accountService: AccountService,
    private paymentService: PaymentService,
    private accountsPaymentsService: AccountsPaymentsService,
    private amountsService: AmountService,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.spinnerState.set(true);
    try {
      await Promise.all([
        this.getAccounts(),
        this.getDocDate(),
        this.getDocNumber(),
        this.getTemplates(),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      this.spinnerState.set(false);
      this._cdRef.detectChanges();
    }

    this.businessInfo = JSON.parse(localStorage.getItem('businessInfo') as string);
  }

  async getDocNumber(): Promise<void> {
    const res = await firstValueFrom(this.paymentService.getPaymentDocNum());
    this.depositForm.patchValue({ docNum: res.msg });
  }

  async getDocDate(): Promise<void> {
    const res = await firstValueFrom(this.accountService.getOperDayNew());
    const [day, month, year] = res.operDay.split('.').map(Number);
    const formattedDate = new Date(year, month - 1, day);
    this.depositForm.patchValue({ docDate: formattedDate });
    this.minDate.set(formattedDate);
  }

  async getAccounts(): Promise<void> {
    const accounts = await firstValueFrom(
      this.accountService.getPaymentAllowed(
        { size: 100, page: 0 },
        { transactionMode: 'TRANSACTION', senderAccount: null }
      )
    );
    if (accounts?.content?.length) {
      this.senderAccounts = accounts.content;
      this.recipientAccounts = accounts.content;
      const firstActive = accounts.content.find((a) => a.status !== 'BLOCKED');
      if (firstActive) {
        this.choosedSenderAccount.set(firstActive);
        this.depositForm.patchValue({ sender: { account: firstActive.altAcctId } });
      }
    }
    this._cdRef.detectChanges();
  }

  async getTemplates(): Promise<void> {
    const res = await firstValueFrom(
      this.accountsPaymentsService.getTransactionListV2(
        { size: 10, page: 0 },
        {
          toAmount: null,
          fullHistory: true,
          statuses: ['SAVED'],
          inn: null,
          fromAmount: 0,
          docNum: null,
          transactionModes: null,
          currency: null,
          windowType: ['DEPOSIT_CLOSE'],
          endDate: null,
          type: 'ANY',
          foreignCurrency: null,
          senderAccount: null,
          parentId: null,
          receiverName: null,
          transactionStepFilter: null,
          searchText: '',
          startDate: null,
          receiverAccount: null,
        }
      )
    );
    if (res?.content) {
      this.templateList.set(res.content);
    }
  }

  toggleTemplateDropdown(): void {
    this.isTemplateOpen = !this.isTemplateOpen;
  }

  chooseSenderAccount(account: Account): void {
    this.choosedSenderAccount.set(account);
    this.depositForm.patchValue({ sender: { account: account.altAcctId } });
    this.openSenderAccount = false;
    this.convertAmountIntoWords();
    this._cdRef.detectChanges();
  }

  chooseRecipientAccount(account: Account): void {
    this.choosedRecipientAccount.set(account);
    this.depositForm.patchValue({ recipient: { account: account.altAcctId } });
    this.openRecipientAccount = false;
    this._cdRef.detectChanges();
  }

  setTemplateName(event: any): void {
    this.templateError = event.target.value?.length <= 0;
    this.templateName = event.target.value;
  }

  setTemplateToForm(template: any): void {
    this.templateName = template.name;
    this.isTemplateOpen = false;
    const findSender = this.senderAccounts.find((a) => a.altAcctId === template.sender?.account);
    if (findSender) {
      this.choosedSenderAccount.set(findSender);
    }
    const findRecipient = this.recipientAccounts.find((a) => a.altAcctId === template.recipient?.account);
    if (findRecipient) {
      this.choosedRecipientAccount.set(findRecipient);
    }
    this.depositForm.patchValue({
      templateId: template.id,
      balance: {
        amount: template.senderAmount?.amount / 100,
        currency: template.senderAmount?.currency,
      },
      description: template.description,
      purposeCode: template.purpose?.code,
      sender: { account: template.sender?.account },
      recipient: { account: template.recipient?.account },
    });
    this._cdRef.detectChanges();
  }

  convertAmountIntoWords(): void {
    const formValue = this.depositForm.getRawValue();
    const entered = this.parseNumber(formValue?.balance?.amount ?? 0);
    const max = this.parseNumber(
      this.choosedSenderAccount().balance?.amount
        ? this.choosedSenderAccount().balance.amount / 100
        : 0
    );

    if (entered > max) {
      this.balanceErrorOver = 'На счёте недостаточно средств';
    } else {
      this.balanceErrorOver = '';
    }

    this.amountInWords = entered ? this.amountsService.numberToWordsRU(entered) : '';
  }

  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const normalized = value.toString().replace(/\s/g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  saveTemplate(): void {
    this.templateCreateModal = true;
  }

  createTemplate(): void {
    this.depositForm.markAllAsTouched();
    if (this.depositForm.invalid) return;
    if (!this.templateName) {
      this.templateError = true;
      return;
    }
    this.accountService.getOperDayNew().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const date = new Date(this.depositForm.value.docDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formatted = `${day}.${month}.${year}`;
      const amount = this.depositForm.getRawValue().balance.amount;
      const amountInCents = Math.round(amount * 100);

      this.depositForm.patchValue({
        isSaved: true,
        name: this.templateName,
        docDate: formatted,
        balance: { amount: amountInCents },
        sender: {
          account: this.choosedSenderAccount().altAcctId,
        },
        recipient: {
          account: this.choosedRecipientAccount().altAcctId,
        },
      });

      const formValue = { ...this.depositForm.getRawValue() };
      this.utilsService.spinnerState$$.next(true);
      this.paymentService.createTemplate(formValue, '', this);
      this.templateCreateModal = false;
    });
  }

  submit(): void {
    this.depositForm.markAllAsTouched();
    if (this.depositForm.invalid) return;
    if (this.balanceErrorOver.length > 0) return;

    const rawDocDate = this.depositForm.value.docDate;
    const date = new Date(rawDocDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formatted = `${day}.${month}.${year}`;

    const amount = this.depositForm.getRawValue().balance.amount;
    const amountInCents = Math.round(amount * 100);

    this.depositForm.patchValue({
      balance: { amount: amountInCents },
      sender: {
        account: this.choosedSenderAccount().altAcctId,
      },
      recipient: {
        account: this.choosedRecipientAccount().altAcctId,
      },
    });

    const formValue = { ...this.depositForm.getRawValue(), docDate: formatted };

    this.utilsService.spinnerState$$.next(true);
    this.paymentService.createTransaction(formValue, 'SAVE', '', this);
  }

  closePage(): void {
    const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/deposits/my-deposits']);
    }
  }

  protected readonly Number = Number;
}