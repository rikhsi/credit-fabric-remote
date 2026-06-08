import { debounceTime, filter, finalize, startWith, switchMap, tap } from 'rxjs';
import { MassPaymentsService } from './../../services/mass-payments.service';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal, output, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { MassPaymentTableFilterComponent } from './components/mass-payment-table-filter/mass-payment-table-filter.component';
import {  MatDividerModule } from '@angular/material/divider';
import { CommonModule, NgClass } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLinkWithHref } from "@angular/router";
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { PaymentGetImportsAllContent, PaymentGetImportsAllRes, PaymentGetImportsAllSortBy } from '../../models/mass-payments.model';
import { MinorToMajorPipe } from 'src/app/shared/lib/minor-to-major.pipe';
import { environment } from 'src/environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { DEFAULT_PAGE_SIZE } from 'src/app/constants';

interface FileRecord {
  id: number;
  name: string;
  status: 'processing' | 'completed';
  author: string;
  date: string;
  quantity: number;
  success: number | null;
  errors: number | null;
  amount: string;
}

@Component({
  selector: 'app-mass-payment-table',
  imports: [
    MatIconModule,
    SvgIconComponent,
    MassPaymentTableFilterComponent,
    MatDividerModule,
    CommonModule,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    RouterLinkWithHref,
    PaginationComponent,
    MinorToMajorPipe,
    TranslateModule
],
  templateUrl: './mass-payment-table.component.html',
  styleUrls: ['./mass-payment-table.component.scss'],
  standalone:true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MassPaymentTableComponent implements OnInit {
  private massPaymentsService = inject(MassPaymentsService)
  private router = inject(Router)
  private fb = inject(FormBuilder);
  @Output() public fileName = new EventEmitter<string>();
  readonly SVG_URL = environment.SVG_URL

  filterForm!:FormGroup;
  tableData = signal<PaymentGetImportsAllContent[]>([])
  totalElements = signal(0)
  loading = signal(false)

  ngOnInit(): void {
    this.initForm();

    this.massPaymentsService.refreshMassPaymentTable$.pipe(
      debounceTime(500),
      startWith(1),
      switchMap(() => this.getPaymentImportFileAll())
    ).subscribe()

  }

  integerPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

  downloadFile(event:Event,record:PaymentGetImportsAllContent) {
    event.stopPropagation()
    console.log('downloadFile',record)
    this.fileName.emit(record.id.toString())
  }

  sort(sortBy: PaymentGetImportsAllSortBy): void {
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

    this.massPaymentsService.refreshMassPaymentTable();
  }


  private initForm() {
   this.filterForm =  this.fb.group({
      page:new FormControl(0),
      size:new FormControl(DEFAULT_PAGE_SIZE),
      fromDocDate:new FormControl(null),
      toDocDate:new FormControl(null),
      statuses:new FormControl(null),
      search:new FormControl(null),
      sortBy: null,
      sortDirection: 'ASC'
    })
  }

  private getPaymentImportFileAll(){
    this.loading.set(true)
    let body = this.filterForm.value;
     return this.massPaymentsService.getPaymentImportFileAll(body).pipe(
      tap((res:PaymentGetImportsAllRes | null)=>  {
        this.tableData.set(res?.content || [])
        this.totalElements.set(res?.totalElements || 0)
        this.loading.set(false)
      }),
      finalize(() => this.loading.set(false))
    )
  }


  handleFilterChange(event:any) {
    this.setValueForFilterForm('search',event.searchText)
    this.setValueForFilterForm('fromDocDate',event.startDate)
    this.setValueForFilterForm('toDocDate',event.endDate)
    this.setValueForFilterForm('statuses',(event.statuses))
    this.massPaymentsService.refreshMassPaymentTable()
  }

  private setValueForFilterForm(field:string,value:any) {
    this.filterForm.get(field)?.setValue(value);
  }


  handlePageChange(event:number) {
    this.setValueForFilterForm('page',event)
    this.massPaymentsService.refreshMassPaymentTable()
  }

  handlePageSizeChange(event:number) {
    this.setValueForFilterForm('size',event)
    this.massPaymentsService.refreshMassPaymentTable()
  }



  navigateCreatePayment(event:Event,record:PaymentGetImportsAllContent) {
    event.stopPropagation()
         this.router.navigate([`/payment/mass-payments/created-payments/${record.id}`], {
          queryParams: {
            transactionGroupUuid:record.transactionGroupUuid,
            type:'all'//'all' | 'signature' | 'under-development' | 'creation-errors'
          }
        });
        localStorage.setItem('fileName', record.fileName)
  }
}
