import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, OnDestroy, OnInit, ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatRipple} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import {ProjectFilterList} from '../../helpers/project-filter-list';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import { Subject, take, takeUntil } from 'rxjs';
import {SalaryProjectService} from "../../../../../../core/services/salary-project.service";
import {ToastrService} from "ngx-toastr";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {MatDialog} from "@angular/material/dialog";
import {EspSignConfirmService} from "../../../../../../core/services/esp-confirm.service";
import {EmployeeContent} from "../../salary-project.model";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {NgClass} from "@angular/common";
import { AccountSelectComponent } from '../../../../../../shared/components/account-select/account-select.component';
import { AccountsDto } from '../../../accounts-payments/models/accounts-payments.model';
import { AccountService } from '../../../../../../core/services/account.service';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { RightBarService } from '../../../../right-bar/services/right-bar.service';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    MatTab,
    MatTabGroup,
    MatButton,
    MatIcon,
    UiSvgIconComponent,
    MatRipple,
    RouterModule,
    MatRipple,
    MatCheckbox,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatPaginator,
    NgClass,
    AccountSelectComponent,
  ],
  templateUrl: './project.component.html',
  styles: `
    .inner-tab {
      .mat-mdc-tab.mdc-tab--active:focus .mdc-tab__text-label,
      .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
        color: #000;
      }

      .mat-mdc-tab.mdc-tab {
        height: 35px;
      }

      .mat-mdc-tab .mdc-tab-indicator__content--underline {
        border: 2px solid #007aff !important;
      }

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
    }

    .file-upload-button {
      overflow: hidden;
      position: relative;

      input[type="file"] {
        font-size: 100px;
        left: 0;
        opacity: 0;
        position: absolute;
        top: 0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ProjectComponent implements OnDestroy, OnInit {
  accounts!: AccountsDto[];
  selectedAccount!: AccountsDto;
  isEditing = false;
  docNum = '';
  changedDocNum = '';
  docDate = '';

  constructor(
    public prjectFilterList: ProjectFilterList,
    private _salaryService: SalaryProjectService,
    private _toast: ToastrService,
    private _cdRef: ChangeDetectorRef,
    protected utilsService: UtilsService,
    private _dialog: MatDialog,
    private espSignConfirmService: EspSignConfirmService,
    private router: Router,
    private accountService: AccountService,
    private _accountPaymentService: AccountsPaymentsService,
    private rightBarService: RightBarService,
  ) {
  }

  selectedFile: File | null = null;
  fileName!: string | null
  isFilter = false;
  private unsub$ = new Subject<void>();
  employeeList: any[] | undefined = []
  waitingEmployeeList: EmployeeContent[] | undefined = []
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageIndex = 0;
  pageSize = 0;

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
    this.salaryForm.patchValue({
      docNum: this.docNum,
    })
    this.toggleEditMode();
    this._cdRef.markForCheck();
  }

  downloadExcelFile() {
    // this.utilsService.spinnerState$$.next(true);
    // this._salaryService.getSalaryExcelFile().pipe(takeUntil(this.unsub$)).subscribe({
    //     next: (res) => {
    //       if (res.success) {
    //         let link = document.createElement('a')
    //         link.setAttribute('type', 'hidden')
    //         link.href = res.result.data.msg
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();
    //       } else {
    //         this._toast.error(res.result.message)
    //       }
    //     },
    //     error: (err) => {
    //       this._toast.error(err.message)
    //     },
    //     complete: () => {
    //       this.utilsService.spinnerState$$.next(false);
    //       this._cdRef.detectChanges()
    //     }
    //   }
    // )
  }



  salaryForm = new FormGroup({
    file: new FormControl<File | null>(null, Validators.required),
    senderAccount: new FormControl('', Validators.required),
    docNum: new FormControl('', Validators.required),
    docDate: new FormControl('', Validators.required),
  })

  submitSalary() {
    if(this.salaryForm.invalid) {
      return;
    }
    const body = this.salaryForm.getRawValue();
    this._salaryService.uploadSalaryExcelFile(body)
      .pipe(takeUntil(this.unsub$))
      .subscribe(res => {
        if (!res.success) return
        this.router.navigate(['/accounts-and-payments'], {
          queryParams: {
            tab: 'payments'
          }
        });
      })
  }

  getDocNum() {
    this._accountPaymentService.getTransactionDocNum()
      .pipe(takeUntil(this.unsub$))
      .subscribe(val => {
        if(val) {
          this.docNum = val.msg;
          this.salaryForm.patchValue({
            docNum: val.msg
          });
          this._cdRef.markForCheck();
        }
      })
  }

  getOperDay() {
    this.rightBarService.getOperDay()
      .pipe(take(1))
      .subscribe(res => {
      if (!res) return;
      this.docDate = res.currentWorkingDate.toString();
      this.salaryForm.patchValue({
        docDate: res.currentWorkingDate.toString()
      })
    })
  }

  getAccounts() {
    this.accountService.getPaymentAllowed(
      { size: 100, page: 0 },
      { senderAccount: null, transactionMode: 'SALARY' }
    ).pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res) => {
          if(res) {
            this.accounts = res.content;
          }
        },
        error: (err) => {
        },
        complete: () => {
          this._cdRef.markForCheck();
        }
      })
  }

  syncEmployeeList() {
    this.utilsService.spinnerState$$.next(true)
    this._salaryService.syncEmployees().pipe(takeUntil(this.unsub$)).subscribe((res)=>{
      if (!res) return
      this.getEmployeeList()
      this._cdRef.detectChanges()
    })
  }
  getEmployeeList(paging = {page: 0, size: 20}) {
    // this._salaryService.getEmployees(paging).pipe(takeUntil(this.unsub$)).subscribe(({
    //   next: (res) => {
    //     this.pageSize = paging.size;
    //     this.paginator.pageIndex = this.pageIndex;
    //     this.paginator.length = <number>res?.totalElements;
    //     this.employeeList = res?.content;
    //     console.log(this.employeeList)
    //     this.waitingEmployeeList = res?.content.filter(l => l.employeeStatus !== 'ACTIVE')
    //   },
    //   complete: () => {
    //     this._cdRef.detectChanges()
    //   }
    // }))
  }

  pageChanged(event: PageEvent) {
    this.utilsService.spinnerState$$.next(true);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    let page = event.pageIndex;
    let size = event.pageSize;
    this.getEmployeeList({page, size});
  }

  selectedSenderAccount(acc: AccountsDto) {
    this.salaryForm.patchValue({
      senderAccount: acc.altAcctId,
    })
  }

  uploadExcelFile(event: any) {
    if (event.target.files) {
      let file: File | null = event.target.files[0]
      this.selectedFile = file;
      this.fileName = file!.name;

      this.salaryForm.patchValue({
        file: file
      })
    }
  }

  getStatus(status: string) {
    switch (status) {
      case 'ACTIVE':
        return 'Активный'
      case 'WAITING':
        return 'Ожидание'
      case 'BLOCKED':
        return 'Заблокировано'
      case 'DELETED':
        return 'Удалено'
      case 'WARNING':
        return 'Предупреждение'
      case 'REQUEST_ACCEPTED':
        return 'Принят'
      case 'CANCELED':
        return 'Отменено'
      case 'CREATED':
        return 'Создано'
      case 'READY':
        return 'Готово'
      case 'SUCCESS':
        return 'Успешно'
      case 'NEW':
        return 'Новый'
    }
    return status
  }

  ngOnInit() {
    this.getDocNum();
    this.getOperDay();
    this.getEmployeeList();
    this.getAccounts();
  }

  ngOnDestroy(): void {
    this.unsub$.next()
    this.unsub$.complete()
  }

}
