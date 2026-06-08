import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {Loan, LoanItem} from '../../models/loan.model';
import { LoansTableComponent } from '../../ui/loans-table/loans-table.component';
import { TableFiltersComponent } from '../../../../../../shared/components/table-filters/table-filters.component';
import { FilterConfig } from "../../../../../../shared/components/table-filters/table-filters.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {LoanService} from "../../services/loan.service";
import {NgIf} from "@angular/common";
import {UserService} from "../../../../../../core/services/user.service";

@Component({
  selector: 'app-loans-my',
  imports: [TableFiltersComponent, LoansTableComponent, NgIf],
  templateUrl: './loans-my.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoansMyComponent implements OnInit {
  readonly loadApi  = inject(LoanService);
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
    {
      name: 'status',
      type: 'select',
      placeholder: 'Статус',
      options: [
        { label: 'Активный', value: 'ACTIVE' },
        { label: 'Просроченный', value: 'EXPIRED' },
      ]
    },
  ];

  ngOnInit() {
    this.getLoanList()
  }

  pinLoan = (loanId: string, hasPin: boolean = false) => {
    if (hasPin) {
      this.loadApi.unPinLoan(loanId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.getLoanList());
    } else {
      this.loadApi.pinLoan(loanId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.getLoanList());
    }
  }

  getLoanList() {
    this.loadApi.getLoanList({status:'OPEN'}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      if (res) {
        this.loanData.set(res.content)
      }
    })
  }
}
