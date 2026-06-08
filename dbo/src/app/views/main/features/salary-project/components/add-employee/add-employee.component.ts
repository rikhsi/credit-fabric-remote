import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component, OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatRipple} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormField, MatSelectModule} from '@angular/material/select';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {Router, RouterModule} from '@angular/router';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {NgxMaskDirective} from "ngx-mask";
import {SalaryProjectService} from "../../../../../../core/services/salary-project.service";
import {ToastrService} from "ngx-toastr";
import {Subject, takeUntil} from "rxjs";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {AccountsDto} from "../../../accounts-payments/models/accounts-payments.model";
import {AccountsPaymentsService} from "../../../accounts-payments/services/accounts-payments.service";
import { AccountService } from '../../../../../../core/services/account.service';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    MatTab,
    MatTabGroup,
    MatButton,
    MatIcon,
    UiSvgIconComponent,
    MatRipple,
    RouterModule,
    MatCheckbox,
    MatFormField,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    ReactiveFormsModule,
    MatRadioButton,
    MatRadioGroup,
    FormsModule,
    NgxMaskDirective,
  ],
  templateUrl: './add-employee.component.html',
  styles: `
    .payment-mat-date,
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
    }

    .payment-currency-select {
      .mat-mdc-select-arrow-wrapper {
        display: none;
      }

      padding-left: 25px;
      font-size: 14px;
    }

    .form-control:checked ~ label {
      color: #007AFF;

      input[type="radio"] {
        background: #E5E7EA
      }
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AddEmployeeComponent implements OnInit {
  selectedValue: string = 'requisite'
  accounts: AccountsDto[] | undefined;
  withRequisiteForm: FormGroup = new FormGroup({
    passportSerial: new FormControl('', Validators.compose([Validators.min(2), Validators.min(2), Validators.required])),
    passportNumber: new FormControl('', Validators.required),
    birthday: new FormControl('', Validators.required),
    phoneNumber: new FormControl('', Validators.required),
    cardType: new FormControl('', Validators.required),
    businessAccount: new FormControl('', Validators.required)
  })
  withCardForm: FormGroup = new FormGroup({
    phoneNumber: new FormControl('', Validators.required),
    businessAccount: new FormControl('', Validators.required),
    cardPan: new FormControl('', Validators.compose([Validators.min(16), Validators.min(16), Validators.required])),

  })
  unsub$ = new Subject<void>();

  constructor(
    private salaryService: SalaryProjectService,
    private toast: ToastrService,
    private router: Router,
    private utilService: UtilsService,
    private accountService: AccountService,
  ) {

  }

  ngOnInit(): void {
    this.getAccountsList()
  }

  formSubmit(type: string) {
    this.utilService.spinnerState$$.next(true)
    if (type === 'requisite' && this.withRequisiteForm.valid) {
      const phone = this.replaceSpaces(this.requisitePhone?.value)
      this.salaryService.addEmployees({
        passportSerial: this.withRequisiteForm.value.passportSerial,
        passportNumber: this.withRequisiteForm.value.passportNumber,
        birthday: this.withRequisiteForm.value.birthday,
        cardType: this.withRequisiteForm.value.cardType,
        businessAccount: this.withRequisiteForm.value.businessAccount,
        phoneNumber: phone
      }).pipe(takeUntil(this.unsub$)).subscribe((res => {
        if (!res) return
        this.toast.success(`Ваша заявка принята ${res.employeeStatus}`)
        this.router.navigate(['salary-project/main'])
      }))
    } else if (type === 'card' && this.withCardForm.valid) {
      const phone = this.replaceSpaces(this.cardPhone?.value)
      this.salaryService.addEmployees({
        phoneNumber: phone,
        cardPan: this.withCardForm.value.cardPan,
        businessAccount: this.withCardForm.value.businessAccount
      }).pipe(takeUntil(this.unsub$)).subscribe((res => {
        if (!res) return
        if (res.employeeStatus === 'WAITING') this.toast.success(`Ваша заявка принята ${res.employeeStatus}`)
        this.router.navigate(['salary-project/main'])
      }))
    }
  }

  getAccountsList() {
    this.accountService.getAccountList({page: 0, size: 100}, {}).subscribe(res => {
      if (!res) return;
      this.accounts = res.content;
    })
  }

  get requisitePhone() {
    return this.withRequisiteForm.get('phoneNumber')
  }

  get cardPhone() {
    return this.withCardForm.get('phoneNumber')
  }

  replaceSpaces(value: string) {
    return value.replaceAll(' ', '')
  }
}
