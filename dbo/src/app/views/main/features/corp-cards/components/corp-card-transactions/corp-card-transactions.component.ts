import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatIcon} from "@angular/material/icon";
import {MatOption} from "@angular/material/autocomplete";
import { DateAdapter, MatNativeDateModule, MatRipple, provideNativeDateAdapter } from '@angular/material/core';
import {MatError, MatFormField, MatLabel, MatSelect, MatSuffix} from "@angular/material/select";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {NgxMaskPipe} from "ngx-mask";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {CorpCardService} from "../../services/corp-card.service";
import {CorpCardTransactionContent, PageRequestWIthDate} from "../../models/corp-card.model";
import {Subject, takeUntil} from "rxjs";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {
  MatDatepicker,
  MatDatepickerInput, MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker, MatEndDate, MatStartDate
} from "@angular/material/datepicker";
import {MatInput} from "@angular/material/input";
import {DatePipe, NgClass} from "@angular/common";
import {MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import { CustomDateAdapter } from '../../../../../../core/services/custom-date-adapter.service';

@Component({
    selector: 'app-corp-card-transactions',
    imports: [
        FormsModule,
        MatCheckbox,
        MatIcon,
        MatOption,
        MatRipple,
        MatSelect,
        MatTab,
        MatTabGroup,
        NgxMaskPipe,
        ReactiveFormsModule,
        UiSvgIconComponent,
        MatPaginator,
        MatLabel,
        MatSuffix,
        MatInput,
        MatFormField,
        MatError,
        MatDatepickerModule,
        NgClass,
        MatIconButton,
        MatTooltip
    ],
    templateUrl: './corp-card-transactions.component.html',
    styles: ``,
    providers: [
        provideNativeDateAdapter(),
        DatePipe,
        MatDatepickerModule,
        { provide: DateAdapter, useClass: CustomDateAdapter },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorpCardTransactionsComponent implements OnInit {
  cardUuid: string | null = ''
  isFetching = false
  unsub$ = new Subject<void>();
  transactionList: CorpCardTransactionContent[] = []
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageIndex = 0;
  pageSize = 0;
  dateForm:FormGroup = new FormGroup({
    startDate:new FormControl<Date | null>(null,Validators.required),
    endDate:new FormControl<Date | null>(null,Validators.required)
  })

  constructor(
    private route: ActivatedRoute,
    private _corpCardService: CorpCardService,
    private cf: ChangeDetectorRef,
    private utilsService:UtilsService,
    private datePipe: DatePipe
  ) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => this.cardUuid = params.get('id'))
    if (this.cardUuid) {
      this.getCorpCardTransactionList(this.cardUuid)
    }
  }

  getCorpCardTransactionList(uuid: string | null, paging = {page: 0, size: 5}) {
    this.transactionList = []
    const {page, size} = paging;
    const payload: PageRequestWIthDate = {
      paging: {page, size},
      uuid: uuid,
      startDate:this.formatDate(this.dateForm.value.startDate) || null,
      endDate:this.formatDate(this.dateForm.value.endDate) || null,
      isCredit: 2
    }
    this.isFetching = true
    this._corpCardService.getTransactionList(payload).pipe(takeUntil(this.unsub$)).subscribe({
      next: (res) => {
        if (res?.content.length) {
          this.pageSize = size;
          this.paginator.pageIndex = this.pageIndex;
          this.paginator.length = res.totalElements;
          this.transactionList = res.content
        }
      },
      complete: () => {
        this.isFetching = false
        this.cf.detectChanges()
      }
    })
  }

  pageChanged(event: PageEvent) {
    this.utilsService.spinnerState$$.next(true);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    let page = event.pageIndex;
    let size = event.pageSize;
    this.getCorpCardTransactionList(this.cardUuid ,{ page, size });
  }
  searchWithDate(){
    if (this.dateForm.valid){
      this.dateForm.patchValue({
        startDate:this.formatDate(this.dateForm.value.startDate),
        endDate:this.formatDate(this.dateForm.value.endDate)
      })
      this.getCorpCardTransactionList(this.cardUuid);
    }
  }
  formatDate(date:Date){
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
  clearFilter(){
    this.dateForm.reset()
    this.getCorpCardTransactionList(this.cardUuid);
  }
}
