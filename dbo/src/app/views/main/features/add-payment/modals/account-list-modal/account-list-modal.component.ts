import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import {ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TemplateService } from '../../../../../../core/services/template.service';
import { ISelectAction } from '../../../../../../shared/interfaces/select-actions.interface';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../../../../core/services/user.service';
import { AccountService } from '../../../../../../core/services/account.service';
import {MatOption} from "@angular/material/core";
import {NgxMaskPipe} from "ngx-mask";
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-accounts-list-modal',
    imports: [CommonModule, MatIconModule, NgxMaskPipe],
    templateUrl: './account-list-modal.component.html',
    styles: [
        `
      .custom-radio {
        display: inline-block;
        position: relative;
        width: 3.5%;
        text-align: center;
        align-items: center;
        padding-left: 30px;
        cursor: pointer;
      }
      .custom-radio input[type="radio"] {
        display: none;
      }

      .custom-radio .radio-circle {
        position: absolute;
        top: -12px;
        left: 25%;
        width: 24px;
        height: 24px;
        border: 1px solid #008C79;
        border-radius: 50%;
        transition: background-color 0.3s ease;
      }
      .custom-radio input[type="radio"]:checked + .radio-circle:after {
        background-color: #008C79;
      }
      .custom-radio .radio-circle::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 17px;
        height: 17px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsListPaymentsComponent implements OnInit {
  protected readonly Math = Math;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: DialogRef,
    private matDialogRef: MatDialogRef<any>,
    private templateService: TemplateService,
    private router: Router,
    private clipBoard: Clipboard,
    private toastrService: ToastrService,
    private userService: UserService,
    private destroyRef: DestroyRef,
    private accountService: AccountService,
    private translateService:TranslateService
  ) {}
  @Output() save = new EventEmitter<void>();

  ngOnInit() {
  }

  closeDialog() {
    this.matDialogRef.close();
  }

  actions: ISelectAction[] = [
    {
      title: 'Закрыть счёт',
      id: 'close',
    },
  ];

  onAction(action: ISelectAction) {
    switch (action.id) {
      case 'history':
        this.openHistory();
        break;
      case 'close':
        // this.closeAccount();
        break;
      default:
    }
  }

  exportToExcel() {
    this.accountService.exportAccountDetailToExcel(this.data);
  }

  copy() {
    const integer = Math.floor(this.data.balance.amount / 100);
    const decimal = (this.data.balance.amount % 100).toString().padStart(2, '0')
    const amount = `${integer},${decimal} ${this.data.balance.currency}`
    const formattedText =
      `Наименование: ${this.data.holderInfo}\n` +
      `Номер счета: ${this.data.accountNumberCard}\n` +
      `ИНН: ${this.data.inn}\n` +
      `Валюта: ${this.data.balance.currency}\n` +
      `МФО: ${this.data.mfo}\n` +
      `Наименование банка: ${this.data.bankName}\n` +
      `SWIFT: ${this.data.swift}\n` +
      `Статус: ${this.data.active ? 'Активный' : 'Неактивный'}`;

    const cleanedText = formattedText
      .replace(/[^\S\r\n]+/g, ' ')
      .trim();

     this.toastrService.info(this.translateService.instant('new.details_copied'));
    this.clipBoard.copy(cleanedText);
  }

  openHistory() {
    this.router.navigate(['account-history', this.data.id], {
      queryParams: {
        accountNumber: this.data.altAcctId,
      }
    });
    this.matDialogRef.close('history');
  }

  protected readonly Number = Number;
}
