import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal} from "@angular/core";
import {TranslateModule} from "@ngx-translate/core";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {NgClass, NgIf} from "@angular/common";
import {NgxMaskDirective, NgxMaskPipe} from "ngx-mask";
import {animate, style, transition, trigger} from "@angular/animations";
import {Account} from "../../../add-payment/components/transfer-to-account/transfer-to-account.component";
import {AmountService} from "../../../../../../core/services/amount.service";
import {firstValueFrom, take} from "rxjs";
import {SpinnerComponent} from "../../../../../../core/components/spinner/spinner.component";
import {AccountsDto} from "../../../accounts-payments/models/accounts-payments.model";
import {AccountService} from "../../../../../../core/services/account.service";

@Component({
  selector: 'app-rate-modal',
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgxMaskPipe,
    NgClass,
    NgxMaskDirective,
    SpinnerComponent
  ],
  templateUrl: './create-payment.component.html',
  styles: ``,
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
  ]
})
export class CreatePaymentComponent implements OnInit {

  public activatedRoute = inject(ActivatedRoute)
  public route = inject(Router)
  public translate = inject(TranslateModule);
  public amountsService = inject(AmountService);
  private _cdRef = inject(ChangeDetectorRef);
  private accountService = inject(AccountService);

  openAccount = signal<boolean>(false);
  openAccountRecipient = signal<boolean>(false);
  choosedAcount = signal<Account | Record<string, any>>({});
  choosedRecipientAcount = signal<Account | Record<string, any>>({});
  accounts = signal<any>([]);
  balanceErrorOver = signal<string>('')
  amountInWords = signal<string>('')
  spinnerState = signal<boolean>(false);
  isOpenPurpose = signal<boolean>(false);
  isOpenCountry = signal<boolean>(false);
  selectedAccountData = signal<AccountsDto | null>(null)


  createForm: FormGroup = new FormGroup({
    type: new FormControl('121'),
    // windowType: new FormControl('TRANSACTION'),
    balance: new FormGroup({
      amount: new FormControl(null, [Validators.required, Validators.min(0.01)]),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    saldo: new FormGroup({
      amount: new FormControl(null),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    description: new FormControl("", [Validators.required, Validators.maxLength(200)]),
    docNum: new FormControl(''),
    docDate: new FormControl(null, Validators.required),
    isAnor: new FormControl(false),
    withAnor: new FormControl(false),
    isSaved: new FormControl(false),
    isAutoPay: new FormControl(false),
    sender: new FormGroup({
      // accountToForm: new FormControl('', Validators.required),
      account: new FormControl('', Validators.required),
      pinfl: new FormControl(null),
    }),
    name: new FormControl(''),
    windowType: new FormControl('TRANSACTION'),
    transactionMode: new FormControl('TRANSACTION'),
    recipient: new FormGroup({
      account: new FormControl('', [Validators.minLength(20), Validators.maxLength(27), Validators.required]),
      codeFilial: new FormControl('', [Validators.minLength(5), Validators.maxLength(5), Validators.required]),
      tax: new FormControl(null),
      name: new FormControl('', Validators.required),
      pinfl: new FormControl(null),
      bankName: new FormControl(''),
      innOrPnfl: new FormControl('', [ Validators.pattern(/^(\d{9}|\d{14})$/), Validators.required]),
    }),
    purpose: new FormGroup({
      name: new FormControl(null, Validators.required),
      code: new FormControl(null),
    }),
  })

  async ngOnInit() {
    this.spinnerState.set(true);
    try {
      // const query = await firstValueFrom(this.activatedRoute.queryParams.pipe(take(1)));

      // const type = this.activatedRoute.snapshot.queryParamMap.get('type');
      // const mode = this.activatedRoute.snapshot.queryParamMap.get('mode');
      //
      // if (type === 'edit') {
      //   await this.getTemplateDetails(query["templateId"]);
      //   this.templateName = query["templateName"];
      //   this.templateId = query["templateId"];
      // }
      //
      // if (type === 'reverse') {
      //   console.log('reverse')
      //   await this.getTransactionOneForReverse();
      // }
      //
      // if (type === 'repeat' || mode === 'transaction') {
      //   await this.getTransactionOneForRepeat();
      // }
      // if (mode === 'mass') {
      //   await this.getTransactionPreError()
      // }
      await Promise.all([
        this.getAccountDataFromQuearyParams(),
        // this.getDocDate(),
        // this.getDocNumber(),
        // this.getPurposeList()
      ]);
    } catch (e) {
    } finally {
      this.spinnerState.set(false);
      this._cdRef.detectChanges();
    }
  }

  async getAccountDataFromQuearyParams(): Promise<void> {
    const params = await firstValueFrom(
      this.activatedRoute.queryParams.pipe(take(1))
    );

    if (params['account']) {
      try {
        const account = JSON.parse(decodeURIComponent(params['account']));

        this.chooseAccFunc(account);
        this.createForm.get('sender')?.get('account')?.setValue(account.altAcctId);
        this.selectedAccountData.set(account);
        this.accounts.set([account]);
      } catch (e) {
        console.error('failed to parse account from query param', e);
      }
    } else {
      await this.getAccounts1();
    }
  }

  backClick() {
    this.route.navigate(['/conversion'])
  }

  async getAccounts1(): Promise<void> {
    const accounts = await firstValueFrom(
      this.accountService.getPaymentAllowed(
        { size: 100, page: 0 },
        { transactionMode: "TRANSACTION", senderAccount: null }
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

  closeChooseAccount() {
    this.openAccount.update(prev => !prev)
  }
  closeChooseAccountRecipient() {
    this.openAccountRecipient.update(prev => !prev)
  }
  choosePurpose() {
    this.isOpenPurpose.update(prev => !prev)
  }
  chooseCountry() {
    this.isOpenCountry.update(prev => !prev)
  }

  chooseAccFunc(account) {
    this.choosedAcount.set(account);
    this.convertAmountIntoWords();
  }

  private parseNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;

    const normalized = value.toString().replace(/\s/g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  convertAmountIntoWords() {
    const formValue = this.createForm.getRawValue();
    const entered = this.parseNumber(formValue?.balance?.amount ?? 0);
    const max = this.parseNumber(this.choosedAcount().balance?.amount
      ? this.choosedAcount().balance.amount / 100
      : 0);
    let validAmount = entered;
    if (entered > max) {
      this.balanceErrorOver.set("На счёте недостаточно средств");
    } else {
      this.balanceErrorOver.set("");
    }

    if (validAmount) {
      this.amountInWords.set(this.amountsService.numberToWordsRU(validAmount));
    } else {
      this.amountInWords.set('');
    }
  }

  protected readonly Number = Number;
}
