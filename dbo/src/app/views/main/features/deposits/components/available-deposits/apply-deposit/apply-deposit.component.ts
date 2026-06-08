import {
  ChangeDetectionStrategy,
  Component, computed, DestroyRef, effect, inject, OnInit, signal,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatRippleModule} from '@angular/material/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgxMaskDirective} from 'ngx-mask';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import {MatIcon} from '@angular/material/icon';
import {ContainerNavComponent} from "../../../../../../../shared/components/container-nav/container-nav.component";
import {
  ContainerTitleComponent
} from "../../../../../../../shared/components/container-title/container-title.component";
import { ActivatedRoute, Router } from '@angular/router';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {DepositService} from "../../../services/deposit.service";
import {data} from "autoprefixer";
import {DepositDetailsDto} from "../../../models/deposits.model";
import {AmountService} from "../../../../../../../core/services/amount.service";
import {AccountsPaymentsService} from "../../../../accounts-payments/services/accounts-payments.service";
import {AccountsDto} from "../../../../accounts-payments/models/accounts-payments.model";
import {AccountSelectComponent} from "../../../../../../../shared/components/account-select/account-select.component";
import {
  AccountRequisitesComponent
} from "../../../../../../../shared/components/account-requisites/account-requisites.component";
import {RightBarService} from "../../../../../right-bar/services/right-bar.service";
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import {MatInput} from "@angular/material/input";
import {ToastrService} from "ngx-toastr";
import {UtilsService} from "../../../../../../../core/services/utils.service";

@Component({
    selector: 'app-apply-deposit',
    imports: [
        CommonModule,
        MatRippleModule,
        FormsModule,
        NgxMaskDirective,
        ReactiveFormsModule,
        UiSvgIconComponent,
        MatIcon,
        ContainerNavComponent,
        ContainerTitleComponent,
        AccountSelectComponent,
        AccountRequisitesComponent,
        MatFormField,
        MatLabel,
        MatInput,
        MatSuffix,
        MatError,
    ],
    templateUrl: './apply-deposit.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ApplyDepositComponent implements OnInit {

  preselectedAccount!: AccountsDto;
  title = signal<string>('')
  id = signal<string>('')
  accounts = signal<AccountsDto[]>([])
  navs = computed(() => [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Доступные депозиты',
      link: '/deposits/available-deposits'
    },
    {
      title: this.title(),
      link: `/deposits/available-deposits/${this.id()}/${this.title()}`
    },
    {
      title: 'Заявка на открытие',
      link: '/'
    },
  ])

  openDepositForm = new FormGroup({
    docNum: new FormControl('', Validators.required),
    docDate: new FormControl('', Validators.required),
    senderAccount: new FormControl('', Validators.required),
    productId: new FormControl('', Validators.required),
    amount: new FormControl('', Validators.required),
    period: new FormControl('', Validators.required),
  })
  private _activatedRoute = inject(ActivatedRoute)
  private _depositService = inject(DepositService)
  public amountService = inject(AmountService)
  private _rightBarService = inject(RightBarService)
  private _accountsPaymentService = inject(AccountsPaymentsService)
  #destroy = inject(DestroyRef)
  public detail = signal<DepositDetailsDto>({} as DepositDetailsDto)
  private _toast = inject(ToastrService)
  private _utilsService = inject(UtilsService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const minAmount = this.detail().minAmount;
      const maxAmount = this.detail().maxAmount;

      // Start with the required validator
      const validators = [Validators.required];

      // Add min validator if minAmount exists
      if (minAmount !== undefined && minAmount !== null) {
        validators.push(Validators.min(minAmount/100));
      }

      // Add max validator if maxAmount exists
      if (maxAmount !== undefined && maxAmount !== null) {
        validators.push(Validators.max(maxAmount/100));
      }

      // Set the validators on the amount control
      this.openDepositForm.controls.amount.setValidators(validators);
      this.openDepositForm.controls.amount.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this._activatedRoute.params.subscribe(params => {
      if (params) {
        this.id.set(params['id'])
        this.title.set(params['name'])
        this.openDepositForm.patchValue({
          productId: params['id']
        })
        this.getDepositDetail(params['id'])
        this.getAccountsList()
        this.getOperationDay()
        this.getDocNum()
      }
    })
  }

  setSenderAccount(event: AccountsDto) {
    this.openDepositForm.patchValue({
      senderAccount: event.altAcctId
    })
  }

  getDepositDetail(id: string) {
    this._depositService.getDepositInfo(id).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
      if (!res) return
      this.detail.set(res)
    })
  }

  getAccountsList() {
    this._accountsPaymentService.getPaymentAllowed({page: 0, size: 100}, {
      senderAccount: null,
      transactionMode: 'DEPOSIT_OPEN'
    }).subscribe(res => {
      if (!res) return;
      this.accounts.set(res.content);
      this.preSelectMinAccount(res);
    })
  }

  preSelectMinAccount(res: any) {
    const accountWithMinAltAcctId = res.content?.reduce((minAcc: any, currentAcc: any) =>
      +currentAcc.altAcctId < +minAcc.altAcctId ? currentAcc : minAcc
    );
    if(accountWithMinAltAcctId) {
      this.preselectedAccount = accountWithMinAltAcctId;
      this.setSenderAccount(accountWithMinAltAcctId);
    }
  }

  getOperationDay() {
    this._rightBarService.getOperDay()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        if (val) {

          this.openDepositForm.patchValue({

            docDate: val?.currentWorkingDate.toString()

          })
        }
      })
  }

  getDocNum() {
    this._accountsPaymentService.getTransactionDocNum()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        if (val) {
          this.openDepositForm.patchValue({
            docNum: val.msg
          })
        }
      })
  }

  formSubmit() {
    this.openDepositForm.markAllAsTouched();
    if (this.openDepositForm.valid) {
      this._utilsService.spinnerState$$.next(true);
      const payload = {
        docNum: this.openDepositForm.value.docNum,
        period: Number(this.openDepositForm.value.period),
        amount: Number(this.openDepositForm.value.amount) * 100,
        docDate: this.openDepositForm.value.docDate,
        senderAccount: this.openDepositForm.value.senderAccount,
        productId: Number(this.openDepositForm.value.productId)
      }
      this._depositService.openDeposit(payload)
        .pipe(takeUntilDestroyed(this.#destroy))
        .subscribe({
          next: (res) => {
            if (res?.id) {
              this._utilsService.spinnerState$$.next(false);
              this._toast.success('Успешно');
              this.router.navigate(['/applications']);
            }
          },
          error: (err) => {
            const message = err.message || err || 'Что-то пошло не так!';
            this._toast.error(message);
          }
        })
    }
  }
}
