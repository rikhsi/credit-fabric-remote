import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { NgxMaskPipe } from 'ngx-mask';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';

import { MyDepositsDto} from '../../models/deposits.model';
import { DepositService } from '../../services/deposit.service';
import { MyDepositDetailsComponent } from './my-deposit-details/my-deposit-details.component';
import {
    ContainerTableComponent
} from "../../../../../../shared/components/common/container-table/container-table.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {DepositsTableActionBtns, MyDepositsTableColumnsHeaders} from "../../constants/table-column";
import {AccountsTableActionBtns} from "../../../accounts-and-payments/constants/table-btns";
import {TableActionsComponent} from "../../../../../../shared/components/table-actions/table-actions.component";

@Component({
    selector: 'app-loans-my',
    imports: [RouterModule, UiSvgIconComponent, NgxMaskPipe, ContainerTableComponent, TableActionsComponent],
    templateUrl: './my-deposits.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyDepositsComponent implements OnInit {
  #destroy =inject(DestroyRef)

  isFetching =signal<boolean>(false)
  errorMessage = signal('');
  pageIndex = signal(0);
  pageSize =signal(10);
  tableColumns = signal(MyDepositsTableColumnsHeaders);
  tableActionBtns = DepositsTableActionBtns;
  depositList = signal<MyDepositsDto[]>([])
  private _depositService = inject(DepositService)
  private matDialog = inject(MatDialog)

  ngOnInit(): void {
    this.getMyDeposits()
  }
  onActionClick(id: any) {}
  getMyDeposits() {
    this.isFetching.set(true)
    this._depositService.getMyDeposits({paging:{page:0,size:20}})
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res) => {
          if (!res) return;
          const updatedDepositList = res.map(deposit => {
            const currentDate = new Date();
            const closingDateString = deposit.closingDate;
            const parts = closingDateString.split('.');
            const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            const closingDate = new Date(formattedDate);
            if (!isNaN(closingDate.getTime())) {
              const timeDifference = closingDate.getTime() - currentDate.getTime();
              const remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

              return {
                ...deposit,
                remainingDays
              };
            } else {
              console.error(`Invalid closing date: ${deposit.closingDate}`);
              return {
                ...deposit,
                remainingDays: null
              };
            }
          });
          this.depositList.set(updatedDepositList)
          this.isFetching.set(false)
        },
        error: (err) => {
          this.errorMessage.set(err.message || err || 'Что-то пошло не так!')
          this.isFetching.set(false)

        }
      });
  }

  onOpenLoanDetails(deposit: MyDepositsDto) {
    const detail  = this.depositList().find((el=> el.account === deposit.account));
      if (detail) {
        this.matDialog.open(MyDepositDetailsComponent, {
          data: detail,
          width: '854px',
          height: '100%',
          position: { right: '0' },
          panelClass: 'right-side-dialog',
        })
      }
  }

}
