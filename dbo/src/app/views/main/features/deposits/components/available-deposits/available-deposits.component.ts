import {CommonModule, NgOptimizedImage} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {RouterModule} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

import {DepositContent, DepositDto} from '../../models/deposits.model';
import {DepositService} from '../../services/deposit.service';
import {DepositCalculatorComponent} from './deposit-calculator/deposit-calculator.component';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {MatRipple} from "@angular/material/core";
import {MatDatepickerToggleIcon} from "@angular/material/datepicker";
import {NgxMaskPipe} from "ngx-mask";
import {AmountService} from "../../../../../../core/services/amount.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-available-deposit',
    imports: [
        CommonModule,
        RouterModule,
        UiSvgIconComponent,
        MatPaginator,
        MatRipple,
        MatDatepickerToggleIcon,
        NgOptimizedImage,
        NgxMaskPipe,
    ],
    templateUrl: './available-deposits.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailableDepositsComponent implements OnInit {
  depositList = signal<DepositContent[]>([])
  pageIndex = signal<number>(0)
  pageSize  = signal<number>(0)
  public amountService   = inject(AmountService)
  #destroy = inject(DestroyRef)
  private _depositService = inject(DepositService)
  private _matDialog = inject(MatDialog)



  ngOnInit(): void {
    this.getAvailableDeposits()
  }

  getAvailableDeposits(params = {page: 0, size: 5, lang: "RUS"}) {
    const {page, size, lang} = params;
    const payload = {paging: {page, size}, params: {lang}};
    this._depositService.getDepositList(payload).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res =>{
      if (!res) return
      // this.pageSize = size;
      // this.paginator.pageIndex = this.pageIndex;
      // this.paginator.length = res.totalElements;
      this.depositList.set(res.content)
    })
  }



  onOpenDepositCalculator() {
    this._matDialog.open(DepositCalculatorComponent, {
      disableClose: true,
      height: '100%',
      data: 'Hello World',
    });
  }

}
