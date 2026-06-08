import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Input, OnInit } from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {CorpCardService} from "../../services/corp-card.service";
import {CorpCardListDto} from "../../models/corp-card.model";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import { MatFormField, MatLabel } from '@angular/material/form-field';
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {NgxMaskDirective} from "ngx-mask";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {NgClass} from "@angular/common";
import {AccountsPaymentsService} from "../../../accounts-payments/services/accounts-payments.service";
import {AccountsDto} from "../../../accounts-payments/models/accounts-payments.model";
import {MatInput} from "@angular/material/input";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {EspSignConfirmService} from "../../../../../../core/services/esp-confirm.service";
import {EspSignConfirmComponent} from "../../../../../../core/components/esp-sign-confirm/esp-sign-confirm.component";
import {MatDialog} from "@angular/material/dialog";
import { AccountService } from '../../../../../../core/services/account.service';
import { AccountSelectComponent } from '../../../../../../shared/components/account-select/account-select.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { PaymentService } from '../../../../../../core/services/payment.service';
import { RightBarService } from '../../../../right-bar/services/right-bar.service';


@Component({
    selector: 'app-corp-card-top-up',
    imports: [
        FormsModule,
        MatFormField,
        MatOption,
        MatSelect,
        NgxMaskDirective,
        ReactiveFormsModule,
        UiSvgIconComponent,
        NgClass,
        MatInput,
        AccountSelectComponent,
        MatLabel
    ],
    templateUrl: './corp-card-top-up.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorpCardTopUpComponent implements OnInit {
  public corpCard = {} as CorpCardListDto;
  isEditing = false;
  docNum = '';
  docDate!: Date;
  changedDocNum = '';

  accounts!: AccountsDto[];
  topUpCorpCardForm: FormGroup = new FormGroup({
    sender: new FormControl('', Validators.required),
    receiver: new FormControl('', Validators.required),
    amount: new FormControl('', Validators.required),
    docNum: new FormControl(null, Validators.required),
    docDate: new FormControl(null, Validators.required),
    description: new FormControl('')
  })
  @Input() public corpCardList: CorpCardListDto[] = []

  constructor(
    private _corpCardService: CorpCardService,
    private accountService: AccountService,
    private utilService: UtilsService,
    private espSignService: EspSignConfirmService,
    private _dialog:MatDialog,
    private destroyRef: DestroyRef,
    private router: Router,
    private paymentService: PaymentService,
    private _cdRef: ChangeDetectorRef,
    private rightBarService: RightBarService,
  ) {
  }

  setDocNum(event: Event) {
    this.changedDocNum = (event.target as HTMLInputElement).value;
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if(this.isEditing) {
      this.changedDocNum = this.docNum;
    } else {
      this.changedDocNum = '';
    }
  }

  saveDocNum() {
    this.docNum = this.changedDocNum;
    this.topUpCorpCardForm.patchValue({
      docNum: this.docNum,
    })
    this.toggleEditMode();
    this._cdRef.markForCheck();
  }

  ngOnInit(): void {
    this.watchCorpCard()
    this.getAccountsList();
    this.getDocNum();
    this.getOperDay();
  }

  getOperDay() {
    this.rightBarService.getOperDay()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.docDate = res.currentWorkingDate;
            this.topUpCorpCardForm.patchValue({
              docDate: this.docDate,
            })
            this._cdRef.markForCheck();
          }
        }
      })
  }

  getDocNum() {
    this.paymentService.getPaymentDocNum()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if(val) {
          this.docNum = val.msg;
          this.topUpCorpCardForm.patchValue({
            docNum: this.docNum,
          })
        }
      })
  }

  private watchCorpCard(): void {
    this._corpCardService.card$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((card) => {
        if (card) {
          this.corpCard = card
        }
      })
  }

  setFormFields(acc: AccountsDto) {
    this.topUpCorpCardForm.patchValue({
      sender: acc.altAcctId,
    })
  }

  getAccountsList() {
    this.accountService.getPaymentAllowed(
      {page: 0, size: 100}, {
        senderAccount: null,
        transactionMode: 'CORP_CARD_TOP_UP'
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
      if (!res) return;
      this.accounts = res.content;
      this._cdRef.markForCheck();
    })
  }

  formSubmit() {
    if (this.topUpCorpCardForm.valid) {
      this.utilService.spinnerState$$.next(true)
      const body = this.topUpCorpCardForm.getRawValue();
      let amount = this.topUpCorpCardForm.value.amount * 100;
      body.amount = amount;
      this._corpCardService.corpCardToUp(body)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res) => {
        if (!res) return
        this.topUpCorpCardForm.reset();
        this.router.navigate(['/accounts-and-payments'], {
          queryParams: {
            tab: 'payments'
          }
        });
        // this.utilService.spinnerState$$.next(true)
        // this.espSignService.paymentSign({
        //   id: res.id,
        //   type: 'TRANSACTION',
        //   hash:''
        // })
        //   .pipe(takeUntilDestroyed(this.destroyRef))
        //   .subscribe((res1) => {
        //     if (res1){
        //       this._dialog.open(EspSignConfirmComponent, {
        //         width: '744px',
        //         data: {...res1, type: 'TRANSACTION'},
        //       });
        //     }
        //   })
      })
    }
  }
}
