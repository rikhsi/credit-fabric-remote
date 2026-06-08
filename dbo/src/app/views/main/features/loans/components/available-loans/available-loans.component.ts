import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import { UtilsService } from 'src/app/core/services/utils.service';

import { ILoanProduct, LoanDto } from '../../models/loan.model';
import { LoanService } from '../../services/loan.service';
import {MatRipple} from "@angular/material/core";
import {MatDatepickerToggleIcon} from "@angular/material/datepicker";
import {NgxMaskPipe} from "ngx-mask";

@Component({
    selector: 'app-available-loans',
    imports: [CommonModule, RouterModule, UiSvgIconComponent, MatPaginator, MatRipple, MatDatepickerToggleIcon, NgxMaskPipe],
    templateUrl: './available-loans.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailableLoansComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageIndex = 0;
  pageSize = 0;
  loanList: ILoanProduct[] = [];

  loading = false;
  errorMessage = '';

  constructor(
    private loanService: LoanService,
    private utilsService: UtilsService,
    private _cdRef: ChangeDetectorRef,
    ) {}

  ngOnInit(): void {
    this.getAllAvailableLoans();
  }

  getAllAvailableLoans(params = { page: 0, size: 20, lang: "RUS" }) {
    const { page, size, lang } = params;
    const payload = { paging: { page, size }, params: { lang } };

    this.loading = true;
    this.loanService.getAllAvailableLoans(payload)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (!res) return;

          this.loanList = res.content;
          this.loading = false;
          this.errorMessage = '';
          this._cdRef.markForCheck();
        },
        error: (err) => {
          this.errorMessage = err || err.message || 'Что то пошло не так...';
          this.loading = false;
          this._cdRef.markForCheck();
        }
      })
  }

  pageChanged(event: PageEvent) {
    this.utilsService.spinnerState$$.next(true);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    let page = event.pageIndex;
    let size = event.pageSize;
    this.getAllAvailableLoans({ page, size, lang: "RUS" });
  }
}
