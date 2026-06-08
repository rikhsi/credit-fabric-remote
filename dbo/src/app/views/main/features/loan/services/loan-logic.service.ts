import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Loan } from '../../loans/models/loan.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { LoanService } from '../../loans/services/loan.service';
import { BehaviorSubject, debounceTime, distinctUntilChanged, finalize, startWith, switchMap, tap } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from 'src/app/constants';

@Injectable()
export class LoanLogicService {
  private router = inject(Router)
  private fb = inject(FormBuilder);

  loading = signal(false)
  
  filterForm!:FormGroup;


  constructor() { }
 

  readonly currencyList = [
    {
    code:'UZS',
    flag:'./assets/flags/radius-0/UZS.png'
  },
    {
    code:'USD',
    flag:'./assets/flags/radius-0/USD.png'
  }
]


  navigateToStatements(accountNumber: any) {
    this.router.navigate(['/reports/create'], {
      queryParams: {
        template_id: 'account-activity',
        account: accountNumber
      }
    });
  }

// #region navigations
  openDetail(event:Event,loanId:any) {
    event.stopPropagation();
    if(!loanId) return;
    this.router.navigate(['/loan/details',loanId])
       
  }

  openPayOffTheLoan(event:Event,loanId:any,loanName:string = '') {
    event.stopPropagation() ;
    if(!loanId) return;
    this.router.navigate(['/loan/pay-off-the-loan',loanId],{
        queryParams: { loanName }
    })
  }

  openPaymentSchedule(event:Event,loanId:any) {
    event.stopPropagation() ;
    if(!loanId) return;
    this.router.navigate(['/loan/payment-schedule',loanId])
  }



openExtract(event:Event,accountNumber:any) {
    event.stopPropagation(); 
    if(!accountNumber) return;
    // loan.detail.accMain)
    this.navigateToStatements(accountNumber)
  }
 // #endregion navigations



 integerPart(balance): string {
    const separator = balance.scale === 3 ? 1000 : balance.scale === 2 ? 100 : balance.scale === 1 ? 10 : 1;
    const amount = (balance.amount ?? 0) / separator;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    if(!balance) {
      return '00'
    }
    const separator = balance.scale === 3 ? 1000 : balance.scale === 2 ? 100 : balance.scale === 1 ? 10 : 1;
    const amount = (balance.amount ?? 0) / separator;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }



  sort(sortBy: any): void {
    const sortByCtrl = this.filterForm.get('sortBy');
    const sortDirCtrl = this.filterForm.get('sortDirection');

    if (!sortByCtrl || !sortDirCtrl) return;

    const isSameField = sortByCtrl.value === sortBy;

    sortByCtrl.setValue(sortBy);

    sortDirCtrl.setValue(
      isSameField
        ? (sortDirCtrl.value === 'ASC' ? 'DESC' : 'ASC')
        : 'ASC'
    );

  }
    initForm(status: 'OPEN' | 'CLOSE' | '') {
      this.filterForm = this.fb.group({
        status: [status],      
        startDate: [null],
        endDate: [null],
        searchText: [''],
        currency: [null],
        page: [0],
        size: [DEFAULT_PAGE_SIZE],
      });

      console.log(1111,this.filterForm.value)
  }

  buildFilterStream(loanService: LoanService) {
    return this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(300),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      tap(() => {this.loading.set(true)}),
      switchMap((filters) => loanService.getLoanList({
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
        searchText: filters.searchText || undefined,
        currency: filters.currency || undefined,
        page: filters.page,
        size: filters.size,
      }).pipe(
        finalize(() => this.loading.set(false))
      )
    )
    );
  }



  handleFilterChange(event: any) {
    this.filterForm.patchValue({
      searchText: event.searchText ?? null,
      startDate: event.startDate ?? null,
      endDate: event.endDate ?? null,
      currency: event.currencyEnum ? event.currencyEnum[0]: null,
      page: 0,
      status:event.status
    });
  }


handlePageChange(page: number) {
  this.filterForm.patchValue({ page });
}

handlePageSizeChange(size: number) {
  this.filterForm.patchValue({ size, page: 0 });
}

}
