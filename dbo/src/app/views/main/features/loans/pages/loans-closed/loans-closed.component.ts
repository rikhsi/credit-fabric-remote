import {ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal} from '@angular/core';
import {Loan, LoanItem} from '../../models/loan.model';
import { TableFiltersComponent } from '../../../../../../shared/components/table-filters/table-filters.component';
import { LoansTableComponent } from '../../ui/loans-table/loans-table.component';
import { FilterConfig } from "../../../../../../shared/components/table-filters/table-filters.model";
import {AccreditService} from "../../../../../../core/services/accredit.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {LoanService} from "../../services/loan.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-loans-closed',
  imports: [TableFiltersComponent, LoansTableComponent, NgIf],
  templateUrl: './loans-closed.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoansClosedComponent {
  readonly loanApi  = inject(LoanService);
  readonly destroyRef = inject(DestroyRef);

  loanData = signal<Loan[]>([]);
  public readonly filterConfig: FilterConfig[] = [
    { name: 'search', type: 'search', placeholder: 'Поиск' },
    {
      name: 'currency',
      type: 'select',
      placeholder: 'Валюта',
      options: [
        { label: 'UZS', value: 'UZS' },
        { label: 'USD', value: 'USD' },
      ]
    },
  ];


  ngOnInit() {
    this.getLoanList()
  }

  getLoanList() {
    this.loanApi.getLoanList({status:'CLOSE'}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      if (res) {
        this.loanData.set(res.content)
      }
    })
  }

}
