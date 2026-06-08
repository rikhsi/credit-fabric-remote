import { ToastrService } from 'ngx-toastr';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';
import { ReportFrequencyEnumKey, StatmentApplicationReqBody, StatmentApplicationResContent } from './models/statement-history.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApplicationsService } from '../../../applications/services/applications.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { ReportType } from './models/report.model';
import { DEFAULT_PAGE_SIZE } from 'src/app/constants';

@Injectable({
  providedIn: 'root'
})
export class StatementHistoryLogicService {
  private applicationsService = inject(ApplicationsService)
  private destroyRef = inject(DestroyRef)
  private toastrService = inject(ToastrService)
  private fb = inject(FormBuilder)

  constructor() {
  }

  filterForm = this.fb.group({
    searchText: new FormControl(''),
    dateTo: new FormControl(null),
    dateFrom: new FormControl(null),
    reportTypes: new FormControl<ReportType[]>([]),
    applicationStatus: new FormControl<string[]>([])
  });

  filters!: StatmentApplicationReqBody

  pageSize = signal<number>(DEFAULT_PAGE_SIZE);
  pageIndex = signal<number>(0);
  totalItems = signal(0);
  reportFrequencyEnum = signal<ReportFrequencyEnumKey | string>('')
  public refreshTrigger$$ = new Subject<void>()
  private _statementHistoryList$$ = new BehaviorSubject<StatmentApplicationResContent[]>([])
  public statementHistoryList$$ = this._statementHistoryList$$.asObservable()

  setFilterForm(form: any) {
    this.filterForm.get('searchText')?.setValue(form.searchText)
    this.filterForm.get('dateTo')?.setValue(form.endDate)
    this.filterForm.get('dateFrom')?.setValue(form.startDate)
    this.filterForm.get('reportTypes')?.setValue(form.type?.value ? ([form.type?.value] as ReportType[]) : null)
    this.filterForm.get('applicationStatus')?.setValue(form.statuses?.value ? [form.statuses?.value] as string[] : null)
    this.refreshTrigger$$.next()
  }

  getAllApplication(): Observable<any> {
    return this.refreshTrigger$$.pipe(
      // startWith(void 0),
      switchMap(() => {
        let dFrom = '';
        let dTo = '';
        const fDate = this.filterForm.get('dateFrom')?.value;
        const tDate = this.filterForm.get('dateTo')?.value;
        if (fDate) {
          dFrom = new Date(fDate).toLocaleDateString('ru-RU');
        }
        if (tDate) {
          dTo = new Date(tDate).toLocaleDateString('ru-RU');
        }

        let body: StatmentApplicationReqBody = {
          ...this.filters,
          searchText: this.filterForm.get('searchText')?.value!,
          dateFrom: dFrom,
          dateTo: dTo,
          reportTypes: this.filterForm.get('reportTypes')?.value as ReportType[],
          applicationStatus: this.filterForm.get('applicationStatus')?.value as string[],
          reportFrequencyEnum: this.reportFrequencyEnum(),
          pageSize: this.pageSize(),
          pageNum: this.pageIndex(),
          applicationTypes: ['REPORT']
        };
        body.isTemplate = this.reportFrequencyEnum() === "REGULAR";
        // console.log('bingo', body)
        return this.applicationsService.getApplications(this.removeNullOrEmptyFieldsFromObject(body));
      }),
      tap((res: any) => {
        if (res) {
          this.totalItems.set(res.totalElements);
          this._statementHistoryList$$.next(res.content)
        }
      }),
      catchError((err) => {
        this.toastrService.error(err)
        return EMPTY
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  private removeNullOrEmptyFieldsFromObject(obj: any): any {
    const cleanedObj: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        cleanedObj[key] = value;
      }
    }

    return cleanedObj;
  }


  pageChange(page: number) {
    this.pageIndex.set(page)
    this.refreshTrigger$$.next()
  }

  sizeChange(size: number) {
    this.pageIndex.set(0)
    this.pageSize.set(size)
    this.refreshTrigger$$.next()
  }
}
