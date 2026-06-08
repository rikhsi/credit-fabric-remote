import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TemplateService } from '../../../../../../core/services/template.service';
import { ISelectAction } from '../../../../../../shared/interfaces/select-actions.interface';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../../../../core/services/user.service';
import { AccountService } from '../../../../../../core/services/account.service';
import {NgxMaskPipe} from "ngx-mask";

@Component({
    selector: 'app-code-purpose-modal',
    imports: [CommonModule, MatIconModule],
    templateUrl: './code-purpose-modal.component.html',
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
export class CodePurposeModalComponent implements OnInit {
  protected readonly Math = Math;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: DialogRef,
    private _cdRef: ChangeDetectorRef,
    private matDialogRef: MatDialogRef<any>,
    private templateService: TemplateService,
    private router: Router,
    private clipBoard: Clipboard,
    private toastrService: ToastrService,
    private userService: UserService,
    private destroyRef: DestroyRef,
    private accountService: AccountService,
  ) {}
  @Output() save = new EventEmitter<void>();
  @Output() setPurpose = new EventEmitter<void>();
  @Input() set purposes(value: any[]) {
    this._purposes = value;
    this._cdRef.markForCheck(); // вручную сообщаем Angular об изменении
  }
  get purposes(): any[] {
    return this._purposes;
  }
  private _purposes: any[] = [];

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
