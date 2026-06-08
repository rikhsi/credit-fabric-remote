import { NgClass, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatOption, MatRipple} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatFormField} from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import {ToastrService} from 'ngx-toastr';
import {Subject, takeUntil} from 'rxjs';

import {MatIcon} from "@angular/material/icon";
import { UtilsService } from '../../../../../../core/services/utils.service';
import { AccountsPaymentsService } from '../../services/accounts-payments.service';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'app-esp-sign-application',
    imports: [
        MatFormField,
        MatOption,
        MatSelect,
        ReactiveFormsModule,
        NgClass,
        MatIcon,
        MatRipple,
        MatInput,
        MatSelectModule,
        NgOptimizedImage,
    ],
    templateUrl: './delete-account.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteAccountComponent implements OnInit, OnDestroy {
  unsub$ = new Subject<void>();
  confirmForm = this.fb.nonNullable.group({
    accountNumber: new FormControl<string[]>([]),
    closeReason: ['', Validators.required]
  });

  reasons = [
    'В связи с ненадобностью',
    'Самоликвидация',
    'В связи с переходом в другой банк',
    'Банкротство ',
  ]

  constructor(
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private accountService: AccountsPaymentsService,
    public dialogRef: MatDialogRef<DeleteAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { accountNumber: string[] },
  ) {
  }

  ngOnInit(): void {
    this.initData();
  }

  initData() {
    if(this.data?.accountNumber && this.data?.accountNumber.length > 0) {
      this.confirmForm.patchValue({
        accountNumber: this.data.accountNumber
      });
    }
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
    this.dialogRef.close();
  }

  onSubmit() {
    if (!this.confirmForm.valid) return;
    this.utilsService.spinnerState$$.next(true);
    const closeReason = this.confirmForm.value.closeReason ?? '';
    this.accountService.deleteAccount(this.confirmForm.value.accountNumber as string[], closeReason)
      .pipe(takeUntil(this.unsub$))
      .subscribe((value) => {
        if (value) {
          this.toastrService.success('Заявление на закрытие отправлен!');
        }
        this.utilsService.spinnerState$$.next(false);
        this.dialogRef.close();
      })
  }
}
