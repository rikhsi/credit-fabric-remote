import {
  ChangeDetectionStrategy,
  Component, DestroyRef,
  EventEmitter, inject, Inject, OnInit,
  Output
} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {NgxMaskDirective} from "ngx-mask";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {NgClass, NgForOf} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AccountsDto} from "../../../accounts-payments/models/accounts-payments.model";
import {AccountsPaymentsService} from "../../../accounts-payments/services/accounts-payments.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatOption} from "@angular/material/autocomplete";
import {MatFormField, MatLabel, MatSelect} from "@angular/material/select";
import {SettingsService} from "../../services/settings.service";
import {take} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {permitUserArray} from "../../models/settings.model";
import { AccountService } from '../../../../../../core/services/account.service';


@Component({
    selector: 'app-attach-account-dialog',
    imports: [
        MatIcon,
        NgxMaskDirective,
        ReactiveFormsModule,
        UiSvgIconComponent,
        NgClass,
        MatOption,
        NgForOf,
        MatSelect,
        MatLabel,
        MatFormField
    ],
    templateUrl: './attach-account-dialog.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttachAccountDialogComponent implements OnInit {
  @Output() add = new EventEmitter<void>()
  accounts: AccountsDto[] | undefined;
  public _dialogRef = inject(MatDialogRef<AttachAccountDialogComponent>)
  private _accountPaymentService = inject(AccountsPaymentsService)
  private accountService = inject(AccountService);
  private _settingsService = inject(SettingsService)
  private _toast = inject(ToastrService)
  private _utilsService = inject(UtilsService)
  #destroy = inject(DestroyRef)


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {id:number , accounts:permitUserArray[]}
  ) {
  }

  addForm: FormGroup = new FormGroup({
    accountNumbers: new FormControl('', [Validators.required]),
  })

  getSelectedAccounts() {
    const selectedAccountNumbers = this.account?.value
    return selectedAccountNumbers.map((account: string) => ({
      userId: this.data.id,
      accountNumber: account
    }));
  }

  formSubmit() {
    if (this.addForm.valid) {
      const selectedAccounts = this.getSelectedAccounts();
      this._utilsService.spinnerState$$.next(true);
      this._settingsService.attachAccount(selectedAccounts).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res) => {
        if (!res) return
         this._toast.success(res.msg)
         this.add.emit()
      })
    }
  }

  get account() {
    return this.addForm.get('accountNumbers')
  }

  getAccountsList() {
    this.accountService.getAccountList({
      page: 0,
      size: 100
    },
      {}).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
      if (!res) return;
      const accountNumbers = this.data.accounts.map(item=> item.accountNumber)
      // @ts-ignore
      this.accounts = res.content.filter(item=>!accountNumbers.includes(item.altAcctId))
    })
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.getAccountsList()
    }, 0)
  }

}
