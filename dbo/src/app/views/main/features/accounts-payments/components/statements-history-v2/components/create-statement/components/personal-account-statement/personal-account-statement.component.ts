import { ToastrService } from 'ngx-toastr';
import { AccountSelectorComponent } from 'src/app/shared/components/account-selector/account-selector.component';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { TransactionModes } from 'src/app/views/auth/constants/transaction-list.const';
import { AccountService } from 'src/app/core/services/account.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animate, style, transition, trigger } from '@angular/animations';
import { SelectDefaultComponent } from 'src/app/shared/components/select-default/select-default.component';
import { SelectOption } from 'src/app/shared/types';
import { InputDefaultComponent } from 'src/app/shared/components/input-default/input-default.component';

import { DatePickerDefaultComponent } from 'src/app/shared/components/date-picker-default/date-picker-default.component';
import { CustomCheckboxComponent } from 'src/app/shared/components/custom-checkbox/custom-checkbox.component';
import { DocumentFormatSelectorComponent } from 'src/app/shared/components/document-format-selector/document-format-selector.component';
import { Account, CreateReportReqDto } from '../../create-statement.model';
import { CreateStatementApiService } from '../../create-statement-api.service';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PreparingYourStatementModalComponent } from '../../../preparing-your-statement-modal/preparing-your-statement-modal.component';
import { StatementCreatedSuccessfullyModalComponent } from '../../../statement-created-successfully-modal/statement-created-successfully-modal.component';
import { ShortCardNumberPipe } from 'src/app/shared/pipes/short-card-number.pipe';
import { ValidationService } from 'src/app/core/services/validation.service';
import { REPORT_FREQUENCY_OPTIONS } from 'src/app/constants';
import { ReportFrequencyEnumRu } from '../../../../models/statement-history.model';

@Component({
  selector: 'app-personal-account-statement',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    NgxMaskPipe,
    ShortCardNumberPipe,
    SelectDefaultComponent,
    InputDefaultComponent,
    DatePickerDefaultComponent,
    CustomCheckboxComponent,
    DocumentFormatSelectorComponent,
    AccountSelectorComponent,
  ],
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
  providers: [DatePipe],
  templateUrl: './personal-account-statement.component.html',
  styleUrls: ['./../../base.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PersonalAccountStatementComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private createStatementApiService = inject(CreateStatementApiService)
  private validationService = inject(ValidationService)
  private datePipe = inject(DatePipe)
  private destroyRef = inject(DestroyRef)
  private router = inject(Router)
  private toastrService = inject(ToastrService)
  private dialog = inject(MatDialog)

  readonly PERSONAL_ACCOUNT_STATEMENTS = [
    {
      label: 'Выписка лицевого счета',
      value: 'PERSONAL_ACCOUNT_STATEMENT'
    },
    {
      label: 'Выписка по документам',
      value: 'DOCUMENT_STATEMENT'
    },
    {
      label: 'Выписка с терминала',
      value: 'TERMINAL_STATEMENT'
    },
    {
      label: 'Выписка по валютным операциям',
      value: 'CURRENCY_OPERATIONS_STATEMENT'
    },
  ]

  // Выписка лицевого счета
  // PERSONAL_ACCOUNT_STATEMENT( code: 7, description: "Выписка лицевого счета"),
  // DOCUMENT_STATEMENT( code: 2, description: "Выписка по документам"),
  // TERMINAL_STATEMENT code: 7.1,
  // description: "Выписка с терминала"),
  // CURRENCY_OPERATIONS_STATEMENT( code: 7.2, description: "Выписка по валютным операциям"),

  readonly REPORT_FREQUENCY_OPTIONS = REPORT_FREQUENCY_OPTIONS
  form!: FormGroup;


  openAccount = signal<boolean>(false);
  accounts = signal<any[]>([])

  ngOnInit(): void {
    this.initForm();
    this.getAccounts()
    this.handleAccountId()
    this.handlereportFrequencyEnumValueBasedOneSchedule()
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => {
      console.log(res)
    })


  }


  choosedAcount = signal<Account | Record<string, any>>({});


  private handleAccountId() {
    this.form.get('account')?.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(300),
      tap(res => {
        let accounts = this.accounts();
        if (accounts.length) {
          accounts.forEach(acc => {
            if (acc.altAcctId == res) {
              this.form.get('accountId')?.setValue(acc.id)
            }
          })
        } else {
          this.form.get('accountId')?.setValue('')
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe()
  }

  private handlereportFrequencyEnumValueBasedOneSchedule() {
    this.form.get('reportRegularScheduleEnum')?.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(300),
      tap(res => {
        if (res == ReportFrequencyEnumRu.ONE_TIME) {
          this.form.get('reportFrequencyEnum')?.setValue('ONE_TIME')
          this.form.get('rangeForm')?.setValue(null)
          this.form.get('singleDate')?.setValue(null)

        } else {
          this.form.get('reportFrequencyEnum')?.setValue('REGULAR')
          this.form.get('rangeForm')?.setValue(null)
          this.form.get('singleDate')?.setValue(null)
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe()
  }

  initForm(): void {
    this.form = this.fb.group({
      applicationName: [''],
      id: [''],
      account: ['', Validators.required],
      accountId: ['', Validators.required],
      rangeForm: [null],
      singleDate: [null],
      isReal: [false],
      autoId: [false],
      reportType: ['PERSONAL_ACCOUNT_STATEMENT', Validators.required],
      reportFileType: ['PDF', Validators.required],
      email: [''],
      sendEmail: [false],
      reportFrequencyEnum: ['', Validators.required],
      reportRegularScheduleEnum: ['', Validators.required],
      page: [0, [Validators.required]],
      size: [10, [Validators.required, Validators.min(1)]]
    });
  }


  close() {

  }
  changeOpenAccount() {
    this.openAccount.update(v => !v)
  }


  getAccounts() {
    this.accountService.getPaymentAllowed({
      size: 100,
      page: 0
    }, {
      transactionMode: "TRANSACTION",
      senderAccount: null
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(accounts => {
      if (accounts) {
        if (accounts.content?.length > 0) {
          this.choosedAcount.set(accounts.content[0]);
          this.form.patchValue({
            sender: {
              account: accounts.content[0].altAcctId
            }
          })
        }
        this.accounts.set(accounts.content || []);
      }
    })
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const rangeFormValue = this.form.value.rangeForm

    const reportData: CreateReportReqDto = {
      applicationName: formValue.applicationName,
      paging: {
        page: formValue.page,
        size: formValue.size
      },
      id: formValue.id,
      account: formValue.account,
      accountId: formValue.accountId,
      date: {
        dateBegin: this.formatDateForBackend(rangeFormValue?.start),
        dateClose: this.formatDateForBackend(rangeFormValue?.end),
      },
      isReal: formValue.isReal,
      autoId: formValue.autoId,
      reportType: formValue.reportType,
      reportFileType: formValue.reportFileType,
      email: formValue.email,
      sendEmail: formValue.sendEmail,
      reportFrequencyEnum: formValue.reportFrequencyEnum || undefined,
      reportRegularScheduleEnum: formValue.reportRegularScheduleEnum
    };

    this.createStatementApiService.createReport(reportData).subscribe({
      next: (response) => {
        let dialog = this.dialog.open(PreparingYourStatementModalComponent)
        dialog.afterClosed().subscribe(_ => {
          this.router.navigate(['/charts/list'])
        })
      },
      error: (error) => {
        this.toastrService.error(error)
      }
    });
  }


  private formatDateForBackend(date: Date): any {
    return this.datePipe.transform(date, 'dd.MM.yyyy');
  }
  onReset(): void {
    this.form.reset({
      isReal: false,
      autoId: false,
      sendEmail: false,
      page: 1,
      size: 10
    });
  }

  protected readonly transactionModes = TransactionModes;
  protected readonly Number = Number;
  protected readonly eval = eval;
  protected readonly setTimeout = setTimeout;

}
