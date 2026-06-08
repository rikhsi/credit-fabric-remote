import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { take } from 'rxjs';
import { UtilsService } from 'src/app/core/services/utils.service';

import { LoanApplicationDto } from '../../models/loan.model';
import { LoanService } from '../../services/loan.service';
import {NgxMaskPipe} from "ngx-mask";
import {MatRipple} from "@angular/material/core";
import {MatDialog} from "@angular/material/dialog";
import {
  TransactionConfirmDialogComponent
} from "../../../accounts-payments/components/transaction-confirm-dialog/transaction-confirm-dialog.component";
import {MyIdDialogConfirmComponent} from "../my-id-dialog-confirm/my-id-dialog-confirm.component";

@Component({
    selector: 'app-loan-applications',
    imports: [CommonModule, MatPaginator, NgxMaskPipe, MatRipple],
    templateUrl: './loan-applications.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanApplicationsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageIndex = 0;
  pageSize = 0;
  loanApplication: LoanApplicationDto[] = [];
  constructor(
    private loanService: LoanService,
    private utilsService: UtilsService,
    private _dialog:MatDialog
  ) {}

  ngOnInit(): void {
    this.getLoanApplications();
  }
  openProductMyIdDialog(id:string,action:string){
      let dialogRef =   this._dialog.open(MyIdDialogConfirmComponent, {
        disableClose: true,
        width:'800px',
        height:'600px',
        data: {
          loanId:id,
          action:action
        }
      })
      dialogRef.componentInstance.confirm.subscribe(() => {
        dialogRef.close()
        this.getLoanApplications()
      })

  }
  getLoanApplications(params = { page: 0, size: 2, lang: 'RUS' }) {
    const { page, size, lang } = params;
    const payload = { paging: { page, size }, params: { lang } };
    this.loanService.getAllLoanProposals(payload).pipe(take(1)).subscribe((loanApplication) => {
      if (!loanApplication) return;
      this.loanApplication = loanApplication.content;
      this.pageSize = size;
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.length = loanApplication.totalElements;
    });
  }

  pageChanged(event: PageEvent) {
    this.utilsService.spinnerState$$.next(true);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    let page = event.pageIndex;
    let size = event.pageSize;
    this.getLoanApplications({ page, size, lang: 'RUS' });
  }
  getStatusLang(status:string){
    switch (status){
      case 'NEW':
        return 'новый'
      case 'PROCESS':
        return 'в процессе'
      case 'CANCEL':
        return 'отменено'
      case 'SUCCESS':
        return 'выполнен'
      case 'ACCEPTED':
        return 'принято'
      case 'ERROR':
        return 'ошибка'
      case 'FAIL':
        return 'провал'
      case 'EXPIRED':
        return 'истек'
    }
    return status
  }
}
