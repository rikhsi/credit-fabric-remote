import {CommonModule, Location} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {NgxMaskDirective} from 'ngx-mask';
import {mergeMap, of} from 'rxjs';
import {DropDownAnimation} from 'src/app/core/animations/menu.animation';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import {UtilsService} from 'src/app/core/services/utils.service';

import {AccountsDto} from '../../../../accounts-payments/models/accounts-payments.model';
import {AccountsPaymentsService} from '../../../../accounts-payments/services/accounts-payments.service';
import {MyOfficeService} from '../../service/my-office.service';
import {ServiceOneDto} from '../../types/my-office.model';
import {PaymentOtpComponent} from '../payment-otp/payment-otp.component';
import {
  EspSignConfirmComponent
} from "../../../../../../../core/components/esp-sign-confirm/esp-sign-confirm.component";
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountSelectComponent } from '../../../../../../../shared/components/account-select/account-select.component';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'app-my-office-payment',
    animations: [DropDownAnimation],
    imports: [
        CommonModule,
        UiSvgIconComponent,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        NgxMaskDirective,
        AccountSelectComponent,
        MatInput
    ],
    templateUrl: './my-office-payment.component.html',
    styles: `
    .payment-select {
      .mdc-notched-outline__leading,
      .mdc-notched-outline__notch,
      .mdc-notched-outline__trailing {
        border-color: #dbdbdb !important;
      }

      .mdc-text-field--outlined {
        --mdc-outlined-text-field-container-shape: 10px !important;
      }

      .mat-mdc-select-arrow {
        display: none;
      }

      .mat-mdc-form-field-flex {
        height: 44px;
        padding: 8px;
      }

      .mat-mdc-form-field-infix {
        padding-top: 16px;
        top: -15px;
      }

      .mat-mdc-select-placeholder,
      .mat-mdc-form-field-input-control,
      .mat-mdc-select-value-text {
        color: #000;
      }

      .mat-mdc-form-field-icon-suffix {
        width: 40px;
      }

      .mat-mdc-text-field-wrapper {
        padding: 0;
      }
    }`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MyOfficePaymentComponent implements OnInit {
  isOpen = false;
  accountCurrency: string | undefined = ""
  accounts!: AccountsDto[];
  service: ServiceOneDto | undefined;
  paymentServiceForm = this.fb.nonNullable.group({
    senderAccount: [null as unknown as string, Validators.required],
    recipientUuid: [null as unknown as string, Validators.required],
    forTest: [true, Validators.required],
    amount: [null as unknown as number, Validators.required],
    params: undefined
  });

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private accountsService: AccountsPaymentsService,
    private myOfficeService: MyOfficeService,
    private matDialog: MatDialog,
    private utilsService: UtilsService,
    private router: Router,
    private toastrService: ToastrService,
  ) {
  }

  ngOnInit(): void {
    this.service = this.location.getState() as ServiceOneDto;
    this.paymentServiceForm.get('recipientUuid')?.setValue(this.service.service.id)
    this.paymentServiceForm.controls.params.setValue(this.service.params)
    // this.myOfficeService.getInfo(this.service.uuid).subscribe(console.log)
    this.getAccountsList()

  }

  getAccountsList() {
    this.accountsService.getPaymentAllowed({page: 0, size: 100}, { transactionMode: 'P2SERVICE', senderAccount: null }).subscribe(res => {
      if (!res) return;
      this.accounts = res.content;
    })
  }

  onSubmit() {
    this.utilsService.spinnerState$$.next(true);
    const amountObj: { amount: number, currency: string | undefined, scale: number } = {
      scale: 2,
      currency: this.accountCurrency,
      amount: this.paymentServiceForm.controls.amount.value * 100
    }
    this.myOfficeService.myOfficePaymentPrepare({
      ...this.paymentServiceForm.value,
      amount: amountObj
    }).pipe()
      .subscribe((val) => {
        if(val?.id) {
          this.toastrService.success('Успешно!');
          this.router.navigate(['/my-office']);
        }
      })
  }

  getAccount(event: { value: string }) {
    const data = this.accounts?.find(res => res.altAcctId === event.value)
    this.accountCurrency = data?.balance.currency
  }

  onSignPayment(res: { additional: string; externalId: string }) {
    this.matDialog.open(EspSignConfirmComponent,
      {
        width: '744px',
        data: res
      })
  }

  onBack() {
    this.location.back();
  }
}
