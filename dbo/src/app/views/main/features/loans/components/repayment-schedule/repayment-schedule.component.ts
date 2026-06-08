import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {LoanService} from "../../services/loan.service";
import {LoanSchedule} from "../../models/loan.model";
import {ContainerNavComponent} from "../../../../../../shared/components/container-nav/container-nav.component";
import {ContainerTitleComponent} from "../../../../../../shared/components/container-title/container-title.component";
import {DecimalPipe} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {NgxMaskPipe} from "ngx-mask";
import {
  ContainerTableComponent
} from '../../../../../../shared/components/common/container-table/container-table.component';
import { LoanScheduleTableColumnsHeaders } from '../../constants/table-column';

@Component({
    selector: 'app-repayment-schedule',
    imports: [
        ContainerNavComponent,
        ContainerTitleComponent,
        DecimalPipe,
        MatIcon,
        NgxMaskPipe,
        ContainerTableComponent
    ],
    templateUrl: './repayment-schedule.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepaymentScheduleComponent implements OnInit {
  isLoading = false
  title = 'График погашения';
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Мои кредиты',
      link: '/loans/loans-my'
    },
    {
      title: this.title,
      link: '/'
    },
  ];
  errorMessage = '';
  public _params = signal<{ id: number, loan1: string }>({id: 0, loan1: ''});
  private _activatedRoute = inject(ActivatedRoute);
  private _loanService = inject(LoanService);
  #destroyRef = inject(DestroyRef);
  private _cdr = inject(ChangeDetectorRef);

  schedule: LoanSchedule = {
    data: [],
    principalBalance: 0,
    totalDept: 0,
    totalAll: 0,
    totalPercent: 0
  };
  total!: any;


  ngOnInit(): void {
    this._activatedRoute.paramMap
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: params => {
          const id = params.get('id') as string;
          this.getLoanSchedule(id)
        }
      });
  }

  getLoanSchedule(id: string) {
    this.isLoading = true
    this._loanService.getLoanSchedule(+id)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: val => {
          if (val) {
            this.schedule = val;
            this.total = {
              repaymentDate: 'Итого',
              recommendedAmount: +val.totalAll,
              amount: +val.totalDept,
              interestOnTermDebt: +val.totalPercent,
              saldo: '',
            };
            this.schedule.data.push(this.total);
          }
          this.isLoading = false;
          this._cdr.markForCheck();
        },
        error: (err: any) => {
          this.errorMessage = err || err.message || 'Что то пошло не так...';
          this.isLoading = false;
          this._cdr.markForCheck();
        }
      })
  }

  protected readonly tableColumns = LoanScheduleTableColumnsHeaders;
}
