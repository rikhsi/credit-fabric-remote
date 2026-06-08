import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {MatDivider} from "@angular/material/divider";
import {MatInput} from "@angular/material/input";
import {NgxMaskDirective} from "ngx-mask";
import {Subject, takeUntil} from "rxjs";
import {AccountsPaymentsService} from "../../../accounts-payments/services/accounts-payments.service";
import {AccountsDto, PurposeContent} from "../../../accounts-payments/models/accounts-payments.model";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../../../core/services/user.service";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {EspSignConfirmComponent} from "../../../../../../core/components/esp-sign-confirm/esp-sign-confirm.component";
import {EspSignConfirmService} from "../../../../../../core/services/esp-confirm.service";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import { AccountService } from '../../../../../../core/services/account.service';

@Component({
    selector: 'app-payment-counteragent',
    imports: [CommonModule, ReactiveFormsModule, UiSvgIconComponent, MatFormFieldModule, MatSelectModule, FormsModule, MatDivider, MatInput, NgxMaskDirective, MatAutocompleteTrigger, MatAutocomplete, MatSlideToggle],
    templateUrl: './payment-counteragent.component.html',
    styles: `

  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PaymentCounteragentComponent implements OnInit, OnDestroy {
  accountsList: AccountsDto[] = [];
  purposes: PurposeContent[] = []
  filteredPurposeCodeList = signal<PurposeContent[]>([]);
  detail: any
  date: string = '';
  private unsub$ = new Subject<void>();
  signForm: FormGroup = new FormGroup({
    type: new FormControl('106'),
    transactionMode: new FormControl('TRANSACTION'),
    saldo: new FormGroup({
      amount: new FormControl('', Validators.required),
      scale: new FormControl(2),
      currency: new FormControl('UZS'),
    }),
    isAnor: new FormControl<boolean>(false),
    isBudget: new FormControl<boolean>(false),
    docNum: new FormControl(''),
    docDate: new FormControl(''),
    sender: new FormGroup({
      account: new FormControl(''),
      codeFilial: new FormControl('01095', Validators.compose([Validators.minLength(5), Validators.maxLength(5)])),
      tax: new FormControl('', Validators.compose([Validators.minLength(9), Validators.maxLength(9)])),
      name: new FormControl(''),
      pinfl: new FormControl(null),
    }),
    recipient: new FormGroup({
      account: new FormControl('', Validators.compose([Validators.minLength(20), Validators.maxLength(27)])),
      codeFilial: new FormControl('', Validators.compose([Validators.minLength(5), Validators.maxLength(5)])),
      tax: new FormControl('', [Validators.minLength(9), Validators.maxLength(9)]),
      name: new FormControl('', Validators.required),
      pinfl: new FormControl(null),
    }),
    purpose: new FormGroup({
      code: new FormControl(null, Validators.required),
      purposeCode: new FormControl(''),
      name: new FormControl('', Validators.required),
    }),
  });

  constructor(
    private fb: FormBuilder,
    private _cf: ChangeDetectorRef,
    private _accountsPaymentsService: AccountsPaymentsService,
    private accountService: AccountService,
    private espConfirmService: EspSignConfirmService,
    private _dialog: MatDialog,
    public userService: UserService,
    private utilsService: UtilsService
  ) {
  }


  form = this.fb.nonNullable.group({
    isCreateTemplate: false,
  });

  getAccounts() {
    this.accountService.getAccountList({page: 0, size: 100}, {}).pipe(takeUntil(this.unsub$)).subscribe({
      next: (res: any) => {
        if (res) {
          this.accountsList = res.content
        }
      },
      complete: () => {
        this._cf.markForCheck()
      }
    });
  }

  checkIsBudget() {
    const isBudget = this.signForm.value.isBudget;
    const isAnor = this.signForm.value.isAnor;
    if(isBudget) {
      this.signForm.patchValue({
        transactionMode: 'BUDGET'
      })
    }
    if(isAnor) {
      this.signForm.patchValue({
        type: '306'
      });
    }
  }

  getPurposeList() {
    this._accountsPaymentsService.getPurposes().pipe(takeUntil(this.unsub$)).subscribe((res) => {
      if (!res) return
      this.purposes = res.map((w: PurposeContent) => ({
        name: `${w.code} - ${w.name}`,
        code: `${w.code}`,
        purposeCode: `${w.purposeCode}`
      }))
      this._cf.detectChanges()
    })
  }

  getSenderName(event: any) {
    if (event) {
      const data = this.accountsList.find((res) => res.altAcctId === event.value)
      this.signForm.patchValue({
        sender: {
          name: data?.accountTitle
        }
      })
    }
  }

  updateSignFormSender() {
    const data = this.userService.userInfo$$.getValue()
    const inn = data?.userInfo.inn
    this.signForm.patchValue({
      type: '106',
      externalId: '1',
      docDate: this.date,
      transactionMode: 'TRANSACTION',
      sender: {
        codeFilial: '01095',
        tax: inn
      },
      saldo: {
        amount: this.signForm.value.saldo.amount * 100,
      },
      purpose: {
        purposeCode: this.signForm.value.code
      }
    });
  }

  getBusinessDetail() {
    const data = this.userService.userInfo$$.getValue()
    const inn = data?.userInfo.inn
    this.signForm.patchValue({
      sender: {
        tax: inn
      }
    })
  }

  ngOnInit(): void {
    this.getAccounts()
    this.getBusinessDetail()
    this.getPurposeList()

    this.signForm.valueChanges.pipe(takeUntil(this.unsub$)).subscribe((val) => {
      if (val.purpose.code) {
        const res = this.#filterPurposeCode(val.purpose.code)
        this.filteredPurposeCodeList.set(res)
      } else {
        this.filteredPurposeCodeList.set(this.purposes)
      }
    })
  }

  #filterPurposeCode(value: string): PurposeContent[] {
    const filterValue = value.toLowerCase();
    return this.purposes.filter((option) =>
      option.code.toLowerCase().includes(filterValue),
    );
  }

  ngOnDestroy(): void {
    this.unsub$.next()
    this.unsub$.complete()
  }

  formSubmit() {
    if (this.signForm.valid) {
      this.updateSignFormSender();
      this.checkIsBudget();
      const body = this.signForm.getRawValue();
      delete body.isAnor;
      delete body.isBudget;
      this.utilsService.spinnerState$$.next(true)
      this._accountsPaymentsService.prepareUzsTransaction(body).pipe(takeUntil(this.unsub$)).subscribe((res) => {
        this.espConfirmService.paymentSign({
          type: 'TRANSACTION',
          id: res!.id
        }).pipe(takeUntil(this.unsub$)).subscribe((res1) => {
          if (!res1) return
          this._dialog.open(EspSignConfirmComponent, {
            width: '744px',
            data: {action: {...res1, type: 'TRANSACTION'}, transaction: {}},
          });
        })

      })
      this.signForm.reset();
      this.updateSignFormSender();
      this._cf.detectChanges()
    }

  }
  getTaxControl(): AbstractControl {
    return this.signForm.get('recipient.tax') as FormControl;
  }

  getCodeFilialControl(): AbstractControl {
    return this.signForm.get('recipient.codeFilial') as FormControl;
  }

  getAccountControl(): AbstractControl {
    return this.signForm.get('recipient.account') as FormControl;
  }

  getRecipientControl(): AbstractControl {
    return this.signForm.get('recipient.name') as FormControl;
  }

  getSenderControl(): AbstractControl {
    return this.signForm.get('sender.name') as FormControl;
  }

  getPurposeControl(): AbstractControl {
    return this.signForm.get('purpose.name') as FormControl;
  }

  getAmountSaldo(): AbstractControl {
    return this.signForm.get('saldo.amount') as FormControl;
  }
}
