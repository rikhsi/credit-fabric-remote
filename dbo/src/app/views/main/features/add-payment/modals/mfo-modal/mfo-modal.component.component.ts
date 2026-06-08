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
  Output,
  signal
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
import {debounceTime, distinctUntilChanged, Subject} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AccountsPaymentsService} from "../../../accounts-payments/services/accounts-payments.service";

@Component({
    selector: 'app-mfo-modal',
    imports: [CommonModule, MatIconModule],
    templateUrl: './mfo-modal.component.component.html',
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
export class MfoModalComponent implements OnInit {
  protected readonly Math = Math;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: DialogRef,
    private _cdRef: ChangeDetectorRef,
    private matDialogRef: MatDialogRef<any>,
    private destroyRef: DestroyRef,
    private accountsPaymentService: AccountsPaymentsService
  ) {}
  @Output() save = new EventEmitter<void>();
  @Output() setMfo = new EventEmitter<void>();

  inputAccSubject = new Subject<any>();
  searchText = signal<string>('');
  mfoListFrom
  @Input() set mfoList(value: any[]) {
    this._mfoList = value;
    this._cdRef.markForCheck();
  }
  get mfoList(): any[] {
    return this._mfoList;
  }
  private _mfoList: any[] = [];

  ngOnInit() {
    this.inputAccSubject.pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.getMfoList(val.target.value)
        this.searchText.set(val.target.value)
      });
  }

  getMfoList(searchText: string) {
    this.accountsPaymentService.getMfoList({
      page: 0,
      size: 1000,
      search: searchText,
      bankBranchCode: null
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this._mfoList = result.content;
        this._cdRef.markForCheck();
      }
    })
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

  protected readonly Number = Number;
}
