import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
import { Account } from '../../create-statement.model';
import { ShortCardNumberPipe } from 'src/app/shared/pipes/short-card-number.pipe';
import { ValidationService } from 'src/app/core/services/validation.service';

@Component({
  selector: 'app-turnover-statement',
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
  templateUrl: './turnover-statement.component.html',
  styleUrls: ['./../../base.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class TurnoverStatementComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private validationService = inject(ValidationService)

  private destroyRef = inject(DestroyRef)

  cityOptions: SelectOption<number>[] = [
    {
      label: 'Ташкент', value: 1,
      hasIcon: true,
      isMatIcon: false,
      icon: 'assets/new-icons/receiver-icon.svg'
    },
    {
      label: 'Самарканд', value: 2, hasIcon: true,
      isMatIcon: false,
      icon: 'assets/new-icons/receiver-icon.svg'
    },
    {
      label: 'Бухара', value: 3, hasIcon: true,
      isMatIcon: false,
      icon: 'assets/new-icons/receiver-icon.svg'
    },
    {
      label: 'Хива', value: 4, hasIcon: true,
      isMatIcon: false,
      icon: 'assets/new-icons/receiver-icon.svg'
    },
  ];


  form = this.fb.group({
    sender: this.fb.group({
      account: [''],
    }),
    city: [''],
    start: [],
    end: [],
    range: this.fb.group({
      start: [''],
      end: ['']
    }),
    done: [false],
    documentFormat: ['CSV']
  });

  openAccount = signal<boolean>(false);
  accounts = signal<any[]>([])
  ngOnInit(): void {
    this.getAccounts()
    this.form.valueChanges.subscribe(res => {
      console.log(res)
    })
  }

  choosedAcount = signal<Account | Record<string, any>>({});

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

  protected readonly transactionModes = TransactionModes;
  protected readonly Number = Number;
  protected readonly eval = eval;
  protected readonly setTimeout = setTimeout;

}
