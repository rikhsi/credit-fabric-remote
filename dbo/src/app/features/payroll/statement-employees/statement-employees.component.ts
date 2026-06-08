import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableFiltersComponent } from '../../../shared/components/table-filters/table-filters.component';
import { StatementEmployeesStore } from './statement-employees.store';
import { DataStateWrapperComponent } from '../../../shared/ui/data-state-wrapper/data-state-wrapper.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { DecimalPipe } from '@angular/common';
import { ExpiryDatePipe } from '../../../shared/pipes/expiry-date.pipe';
import { ShortCardNumberPipe } from '../../../shared/pipes/short-card-number.pipe';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { cardStatusIcons } from '../../../shared/models/card-status';
import {
  SalaryEmployeesDetailsComponent
} from "../../../views/main/features/salary-employees-details/salary-employees-details.component";
import {MatDialog} from "@angular/material/dialog";
import {SalaryCardRes} from "../../../entities/salary/salary.model";
import {HighlightDirective} from "../../../shared/directives/high-light.directive";

@Component({
  selector: 'app-statement-employees',
  imports: [
    TableFiltersComponent,
    DataStateWrapperComponent,
    PaginationComponent,
    DecimalPipe,
    ExpiryDatePipe,
    ShortCardNumberPipe,
    IconComponent,
    HighlightDirective
  ],
  templateUrl: './statement-employees.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementEmployeesComponent {
  readonly store = inject(StatementEmployeesStore);
  protected readonly cardStatusIcons = cardStatusIcons;
  private readonly _matDialog = inject(MatDialog);


  showDetails(employee: SalaryCardRes) {
    console.log(employee);
    const dialog = this._matDialog.open(SalaryEmployeesDetailsComponent, {
      width: '550px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
      data: employee,
    });
    dialog.componentInstance.onDetail.subscribe(res => {
      console.log(res, "res")
      if (res) {

      }
      dialog.close()
    })

  }
}
