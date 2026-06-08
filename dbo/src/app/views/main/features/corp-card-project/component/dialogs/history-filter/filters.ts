// Angular
import { RouterModule } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, output } from '@angular/core';
import { NgxMaskDirective } from "ngx-mask";
import { MatMenu } from "@angular/material/menu";
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChip, MatChipRemove } from "@angular/material/chips";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { animate, style, transition, trigger } from "@angular/animations";
import { MatDatepicker, MatDatepickerInput } from "@angular/material/datepicker";
import { TranslateModule } from "@ngx-translate/core";


// Dialog
import { FilterModalComponent } from 'src/app/shared/components/filter-modal/filter-modal.component';

// Models
import { paymentMapNew, statusListToMap } from '../../../../transaction-detail/model/transaction-detail.interface';



@Component({
  selector: 'Filters',
  templateUrl: './filters.html',
  imports: [
    // Flow controller
    NgIf,
    NgForOf,
    NgOptimizedImage,
    FormsModule,
    CommonModule,
    RouterModule,
    // Mask
    NgxMaskDirective,
    // Form builder
    ReactiveFormsModule,
    // UI
    MatMenu,
    MatDatepicker,
    MatDatepickerInput,
    MatChip,
    MatChipRemove,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    TranslateModule
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scaleY(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scaleY(0.95)' }))
      ])
    ])
  ],
  styles: [
    `
      .cdk-overlay-container {
        z-index: 2000 !important;
      }
      ::ng-deep .mat-calendar-body-selected {
        background-color: #00A38D !important;
      }
    `
  ]
})



export class HistoryFilterDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    protected _matDialogRef: MatDialogRef<FilterModalComponent>,
    private _cdRef: ChangeDetectorRef,
  ) { }

  protected readonly Math = Math;
  protected readonly statusListToMap = statusListToMap;
  protected readonly console = console;
  protected readonly paymentMap = paymentMapNew;
  public readonly onDetail = output<string>()

  isOpen: boolean = false;
  isOpenTransaction: boolean = false;
  isOpenStatus: boolean = false;
  loading = false;


  filter: any = {
    searchText: "",
    status: "",
    startDate: null,
    endDate: null,
    fromAmount: "",
    toAmount: "",
    isCredit: null
  } 
  selectedPeriod: 'today' | 'yesterday' | 'week' | 'month' | null = null;


  ngOnInit() {
    this.filter = {
      searchText: this.data.filterForm.searchText,
      status: this.data.filterForm.statuses,
      startDate: this.data.filterForm.startDate,
      endDate: this.data.filterForm.endDate,
      fromAmount: this.data.filterForm.fromAmount,
      toAmount: this.data.filterForm.toAmount,
      isCredit:  this.filter.isCredit ?? null,
    }
  }


//  Filter actions

  protected setValuesToFilter() {
    this.data.setFilter({
      status: this.filter.status ?? null,
      startDate: this.filter.startDate ?? null,
      endDate: this.filter.endDate ?? null,
      isCredit:  this.filter.isCredit ?? null,
      fromAmount: this.filter.fromAmount?.length > 0 ? Number(this.filter.fromAmount.replace(" ", "")) : null,
      toAmount: this.filter.toAmount?.length > 0 ? Number(this.filter.toAmount.replace(" ", "")) : null,
    });
    this._matDialogRef.close();
  }

  protected resetValues() {
    this.data.setFilter({
      searchText: "",
      status: null,
      startDate: null,
      endDate: null,
      fromAmount: null,
      toAmount: null,
      isCredit: null
    });
    this._matDialogRef.close();
  }

  protected removeFilter(key: keyof typeof this.filter): void {
    if (this.filter.hasOwnProperty(key)) {
      if (key === 'isCredit') {
       this.filter.isCredit = null; 
      }
      if (key === 'searchText') {
        this.filter[key] = '';
      } else if (key === 'startDate' || key === 'endDate') {
        this.filter[key] = null;
      } else {
        this.filter[key] = '';
      }
    }
  }

// Amount filter

   protected amountChange(event: any, from: boolean) {
    if (from) {
      this.filter.fromAmount = event.target.value;
    } else {
      this.filter.toAmount = event.target.value;
    }
  }

  // Date filter

  protected setPeriodToday() {
    const today = new Date();
    const startDate = new Date(today.setHours(0, 0, 0, 0));
    const endDate = new Date(today.setHours(23, 59, 59, 999));

    this.filter.startDate = startDate;
    this.filter.endDate = endDate;
    this.selectedPeriod = "today"
    this._cdRef.detectChanges()
  }

  protected setPeriodYesterday() {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);

    this.filter.startDate = startDate;
    this.filter.endDate = endDate;
    this.selectedPeriod = "yesterday"
    this._cdRef.detectChanges()
  }

  protected setPeriodWeek() {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);

    this.filter.startDate = startDate;
    this.filter.endDate = endDate;
    this.selectedPeriod = "week"
    this._cdRef.detectChanges()
    console.log(this.selectedPeriod, "ee")
  }

  protected setPeriodMonth() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    this.filter.startDate = startDate;
    this.filter.endDate = endDate;
    this.selectedPeriod = "month"
    this._cdRef.detectChanges()
  }

  protected onDateChange(event: any, from: boolean) {
    if (from) {
      this.filter.startDate = event.value;
    } else {
      this.filter.endDate = event.value;
    }
    this.selectedPeriod = null;
  }

  protected formatDate(createdAt: string): string {
    const [datePart, timePart] = createdAt.split(" ");
    const [day, month, year] = datePart.split(".");
    const [hour, minute] = timePart.split(":");

    const months = [
      "января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];

    const monthName = months[parseInt(month, 10) - 1];

    return `${parseInt(day, 10)} ${monthName} ${year}, ${hour}:${minute}`;
  }
}
