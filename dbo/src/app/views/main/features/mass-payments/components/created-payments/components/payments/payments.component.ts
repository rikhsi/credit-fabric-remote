import { environment } from 'src/environments/environment';
import { catchError, combineLatest, concatMap, EMPTY, finalize, forkJoin, of, shareReplay, tap } from 'rxjs';
import { AsyncPipe, CommonModule, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { CREATED_PAYMENTS_TABS, CreatedPaymentsKey } from 'src/app/views/main/features/new-main/constants/new-main.const';
import { PaymentFilterComponent } from './components/payment-filter/payment-filter.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { PaymentListItemComponent } from './components/payment-list-item/payment-list-item.component';
import { MassPaymentsService } from '../../../../services/mass-payments.service';
import { BehaviorSubject, debounceTime, distinctUntilChanged, map, Observable, switchMap } from 'rxjs';
import { GetPaymentImportFileDataReq, GetPaymentImportFileDataRes, GetPaymentImportFileDataResContent } from '../../../../models/mass-payments.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountsPaymentsService } from 'src/app/views/main/features/accounts-payments/services/accounts-payments.service';
import { getGroupedTransactions } from 'src/app/core/utils';
import { TransactionStatusItem } from 'src/app/views/main/features/accounts-payments/models/accounts-payments.model';
import { BalanceComponent } from '../../../../../new-main/components/balance/balance.component';
import { ToastrService } from 'ngx-toastr';
import { HttpEventType } from '@angular/common/http';
import { DownloadMetadata, ToastrProgressService } from 'src/app/shared/services/toastr-progress.service';
import { MoneyIntPipe } from 'src/app/shared/pipes/money-int.pipe';
import { MoneyDecPipe } from 'src/app/shared/pipes/money-dec.pipe';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EspSignConfirmComponent } from 'src/app/core/components/esp-sign-confirm/esp-sign-confirm.component';
import {
  HistorySignModalComponent
} from "../../../../../../../../shared/components/history-sign-modal/history-sign-modal";
import { DEFAULT_PAGE_SIZE } from 'src/app/constants';

@Component({
  selector: 'app-payments',
  imports: [
    CommonModule,
    TranslateModule,
    SvgIconComponent,
    PaymentFilterComponent,
    PaginationComponent,
    PaymentListItemComponent,
    AsyncPipe,
    BalanceComponent,
    MoneyIntPipe,
    MoneyDecPipe,
    MatDialogModule
  ],
  templateUrl: './payments.component.html',
  styles: ``,
  standalone:true,
  changeDetection: ChangeDetectionStrategy.Default
})
export  class PaymentsComponent implements OnInit,OnDestroy {
  private route = inject(Router)
  private activatedRoute = inject(ActivatedRoute)
  private massPaymentsService = inject(MassPaymentsService);
  private destroyRef = inject(DestroyRef)
  private accountsPayments = inject(AccountsPaymentsService)
  private _cdRef = inject(ChangeDetectorRef)
  private translateService = inject(TranslateService);
  private toastrService = inject(ToastrService)
  private toastrProgressService = inject(ToastrProgressService)
  private _matDialog = inject(MatDialog)

  SVG_URL = environment.SVG_URL
  balance = signal<any>({
    amount: 0,
    scale: 2,
    currency: "UZS",
  })


  paymentDataAll = signal<GetPaymentImportFileDataResContent[]>([])
  paymentDataError = signal<GetPaymentImportFileDataResContent[]>([])
  paymentDataSigniture = signal<GetPaymentImportFileDataResContent[]>([])
  paymentDataUnderDevelopment = signal<GetPaymentImportFileDataResContent[]>([])


  filter: any;
  transactionFilter:any
  signatureCount = signal(0);
  underDevelopmentCount = signal(0);
  allPaymentCount = signal(0);
  creationErrorsCount = signal(0);
  loading = signal(false);

  paymentId = signal('');
  setSelectedFromTable: { amount: number; id: string }[] = [];

  isSelectionMode = false;
  allSelected = false;
  selectedAmount: number = 0;
  transactionsArray: any[] = [];
  fileTransactionId: string = '';
  wasAllSelectedInitially = false;

  // #region PAYMENT VARIABLES
  transactionMode = signal('FILE_TRANSACTION_PARENT')
  reloading = signal(false);
  pageIndex = signal(0);
  pageSize = signal(DEFAULT_PAGE_SIZE);
  totalItems = signal(0);

  errorMessage = signal('');
  transactionGroupUuid = signal<string>('')

  grouped = signal<any>(null);
  groupedSignature = signal<any>([]);

  groupedUnderDevelopment = signal<any>(null);
  groupedUnderDevelopmentData = signal<any>([]);
  filterChangeCount = signal(0)
  fileStatus = signal<any>(null)
  // #endregion PAYMENT VARIABLES
  private _searchText$ = new BehaviorSubject<string>('')
  public searchText$:Observable<string> = this._searchText$.asObservable().pipe(
    debounceTime(500),
    distinctUntilChanged(),
    takeUntilDestroyed(this.destroyRef)
  )
  transactionStatuses = signal<TransactionStatusItem[]>([])
  public readonly activeTabs = signal<CreatedPaymentsKey>('all');
  massivePaymentFileStatistics = signal<any>(null)

  private activeDownloads = new Map<string, number>();



  ngOnInit(): void {
    this.loading.set(true)
    this.accountsPayments.getTransactionStatusList().pipe(
      finalize(() => {
        this.initFilters()
      })
    ).subscribe(res => {
        this.transactionStatuses.set(res || [])
    })

    window.addEventListener('retry-download', this.handleRetryEvent.bind(this));

  }

  ngOnDestroy(): void {
    window.removeEventListener('retry-download', this.handleRetryEvent.bind(this));
    this.activeDownloads.clear();
  }


  private getCurrentTabsDatas():Observable<any> {
    if (this.activeTabs() === 'signature') {
      return this.getPaymentsSignature()
    }else if(this.activeTabs() == 'under-development') {
      return  this.getPaymentsUnderDevelopment()
    }else if(this.activeTabs() == 'all') {
      return  this.getPaymentImportFileData(this.paymentId())
    }else if(this.activeTabs() == 'creation-errors') {
     return this.getPaymentImportFileData(this.paymentId())
    }
    return EMPTY
  }



  getPaymentsUnderDevelopment() {
    this.loading.set(true)
    const excludedStatuses = ['PREPARE', 'PRE_ERROR'];

    const baseBody: GetPaymentImportFileDataReq = {
    page: this.pageIndex(),
    size: this.pageSize(),
    fileId: +this.paymentId(),
    search: '',
    fromAmount: null,
    toAmount: null,
      statuses: this.transactionStatuses()
       .filter(({ code }) => !excludedStatuses.includes(code))
        .map(({ code }) => code),
  };

  if (this.filter) {

    baseBody.fromAmount = this.filter.fromAmount;
    baseBody.toAmount = this.filter.toAmount;
    baseBody.search = this.filter.searchText;
  }


  return this.massPaymentsService.getPaymentImportFileData(baseBody).pipe(
    tap((res) => {
      if (!res) return;

      this.paymentDataUnderDevelopment.set(res.content)
     this.transactionsArray = res.content
      this.totalItems.set(res.totalElements);
      this.pageSize.set(res.pageable.pageSize);
      this.pageIndex.set(res.pageable.pageNumber);
      this.loading.set(false)
    }),
    finalize(() =>  this.loading.set(false))
  );
  }

  getPaymentsSignature() {
     this.loading.set(true)
    const baseBody: GetPaymentImportFileDataReq = {
    page: this.pageIndex(),
    size: this.pageSize(),
    fileId: +this.paymentId(),
    search: '',
    statuses:  ["PREPARE"],
    fromAmount: null,
    toAmount: null,
  };

  if (this.filter) {
    baseBody.fromAmount = this.filter.fromAmount;
    baseBody.toAmount = this.filter.toAmount;
    baseBody.search = this.filter.searchText;
  }



  return this.massPaymentsService.getPaymentImportFileData(baseBody).pipe(
    tap((res) => {
      if (!res) return;
      this.paymentDataSigniture.set(res.content || []);
      this.transactionsArray = res.content ||[]
      this.totalItems.set(res.totalElements);
      this.pageSize.set(res.pageable.pageSize);
      this.pageIndex.set(res.pageable.pageNumber);
      this.loading.set(false)
    }),
    finalize(() =>  this.loading.set(false))
  );



  }

  private getPaymentImportFileData(id:string) {
    this.loading.set(true)
    const baseBody: GetPaymentImportFileDataReq = {
    page: this.pageIndex(),
    size: this.pageSize(),
    fileId: +id,
    search: '',
    statuses: [],
    fromAmount: null,
    toAmount: null,
  };

  if (this.filter) {
    baseBody.statuses = this.filter.statuses || [];
    baseBody.fromAmount = this.filter.fromAmount;
    baseBody.toAmount = this.filter.toAmount;
    baseBody.search = this.filter.searchText;
  }

  const body: GetPaymentImportFileDataReq =
    this.activeTabs() === 'all'
      ? baseBody
      : { ...baseBody, isError: true };

  return this.massPaymentsService.getPaymentImportFileData(body).pipe(
    tap((res) => {
      if (!res) return;

      if (this.activeTabs() === 'creation-errors') {
        this.paymentDataError.set(res.content || []);
      } else {
        this.paymentDataAll.set(res.content || []);
      }

      this.totalItems.set(res.totalElements);
      this.pageSize.set(res.pageable.pageSize);
      this.pageIndex.set(res.pageable.pageNumber);
      this.loading.set(false)
    }),
    finalize(() =>  this.loading.set(false))
  );
  }

   private handleRetryEvent(event: Event) {
    const customEvent = event as CustomEvent;
    const { id, metadata } = customEvent.detail;


    // Remove old toast
    this.toastrProgressService.removeToast(id);

    // Restart download with original metadata
    this.startDownload(metadata);
  }


  getMassivePaymentFileStatistics(fileId:string) {
   return this.massPaymentsService.getMassivePaymentFileStatistics(fileId).pipe(tap(res => {
    if(res) {
      this.massivePaymentFileStatistics.set(res)
      this.fileStatus.set(res.fileStatus)
      this.allPaymentCount.set(res.all.count)
      this.underDevelopmentCount.set(res.underDevelopment.count);
      this.signatureCount.set(res.prepared.count);
      this.creationErrorsCount.set(res.error.count)
    }
   }))
  }

  changeCurrency(event:any) {
  }

private initFilters() {

  const route$ = combineLatest([
    this.activatedRoute.params.pipe(
      map(params => params['id']),
      distinctUntilChanged()
    ),
    this.activatedRoute.queryParamMap
  ]).pipe(
    tap(([id, queryParams]) => {
      this.paymentId.set(id);
      this.transactionGroupUuid.set(
        queryParams.get('transactionGroupUuid') || ''
      );
      this.activeTabs.set(
        (queryParams.get('type') as CreatedPaymentsKey) || 'all'
      );
    }),
    shareReplay(1)
  );


  route$.pipe(
    map(([id]) => id),
    distinctUntilChanged(),
    switchMap(id => this.getMassivePaymentFileStatistics(id)),
    tap(() => this.handleBalance()),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe();


  route$.pipe(
    switchMap(() => this.getCurrentTabsDatas()),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe();

}





  setPaymentActiveTab(k: CreatedPaymentsKey) {
    this.activeTabs.set(k);
     this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { type: k },
      queryParamsHandling: 'merge'
  });
  }


private handleBalance() {
  const stats = this.massivePaymentFileStatistics();

  this.balance.set(
    stats?.all?.amount ?? { amount: 0, scale: 2, currency: 'UZS' }
  );
}

  resetAll() {
    this.loading.set(true);
    this.filterChangeCount.set(0)
    this.pageIndex.set(0)
    this.pageSize.set(DEFAULT_PAGE_SIZE);
    this.totalItems.set(0);
    this.filter = {
      transactionModes: null,
      fromAmount: null,
      senderAccount: null,
      toAmount:  null,
      startDate:  null,
      endDate: null,
    };
    this._searchText$.next('')
    this.transactionsArray = [];
    this.grouped.set([])
    this.groupedUnderDevelopment.set([])
    this._cdRef.detectChanges();
  }

 downloadErrors(isError: boolean) {
    const metadata: DownloadMetadata = {
      body: {
        fileId: this.paymentId(),
        statuses: isError ? ['PRE_ERROR'] : undefined
      },
      fileName: `payment_errors_${this.paymentId()}.xlsx`,
      endpoint: 'downloadPaymentFile'
    };

    this.startDownload(metadata);
  }

  /**
   * Download payment file
   */
  downloadPayment(fileId: string, isError: boolean = false) {
    const metadata: DownloadMetadata = {
      body: {
        fileId,
        ...(isError && { statuses: ['PRE_ERROR'] })
      },
      fileName: `payment_${this.paymentId()}.xlsx`,
      endpoint: 'downloadPaymentFile'
    };

    this.startDownload(metadata);
  }


  private startDownload(metadata: DownloadMetadata) {
    const { fileName, body } = metadata;

    if (this.activeDownloads.has(fileName)) {
      console.warn('⚠️ Already downloading:', fileName);
      return;
    }

    const toastId = this.toastrProgressService.addToast(metadata);
     if (toastId === null) {
      return;
    }
    this.activeDownloads.set(fileName, toastId);

    this.massPaymentsService.downloadPaymentFile(body).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.DownloadProgress) {
          const downloadedBytes = event.loaded;
          const totalBytes = event.total || 0;

          this.toastrProgressService.updateProgress(toastId, downloadedBytes, totalBytes);

        } else if (event.type === HttpEventType.Response) {
          this.toastrProgressService.setSuccess(toastId);
          this.activeDownloads.delete(fileName);

          const blob = event.body as Blob;
          this.saveFile(blob, fileName);

          setTimeout(() => {
            this.toastrProgressService.removeToast(toastId);
          }, 3000);
        }
      },
      error: (error) => {
        console.error('Download error:', error);
        this.toastrProgressService.setError(toastId);
        this.activeDownloads.delete(fileName);
      }
    });
  }


private saveFile(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}

  handlePageChange(event:number) {
    if(event != this.pageIndex()) {
    this.pageIndex.set(event)

    this.getCurrentTabsDatas().subscribe()
    }

  }

  handlePageSizeChange(event:number) {
    if(event != this.pageSize()) {
    this.pageIndex.set(0)
    this.pageSize.set(event)
    this.getCurrentTabsDatas().subscribe()
    }

  }


  handleSign(event:any): void {

  }

  handleRepeat(event:any): void {

  }

  handleShare(event:any): void {

  }

  handlePrint(event:any): void {

  }




  // #region PAYMENT


  handleCancelSelectAll() {
    this.isSelectionMode = false;
    this.selectedAmount = 0;
    this.setSelectedFromTable = [];
    this.allSelected = false;
    this.wasAllSelectedInitially = false;
  }


  selectedFromTableFunc(transaction: any) {
   return this.setSelectedFromTable.some(t => t.id === transaction.transactionId)
  }

 onSelectionChange(event: { id: string; amount: number; checked: boolean }) {
    if (event.checked) {
      this.setSelectedFromTable.push({ id: event.id, amount: event.amount });
    } else {
      this.setSelectedFromTable = this.setSelectedFromTable.filter(t => t.id !== event.id);
      if (this.wasAllSelectedInitially) {
        this.allSelected = false;
      }
    }

    if (this.setSelectedFromTable.length === this.transactionsArray.length) {
      this.allSelected = true;
    } else {
      this.allSelected = false;
    }

    this.selectedAmount = this.setSelectedFromTable.reduce((acc, cur) => acc + cur.amount, 0) / 100;
  }


  toggleSelectAll() {
    this._cdRef.detectChanges();
    if(this.totalItems() > this.pageSize()) {
        this.pageIndex.set(0)
        this.pageSize.set(this.totalItems())
        this.filter = {...this.filter,size:this.pageSize()}
        if (this.activeTabs() === 'signature') {
          this.getPaymentsSignature().pipe(finalize(() => this.handleSelectAllContent())).subscribe()
        }else if(this.activeTabs() == 'under-development') {
            this.getPaymentsUnderDevelopment().pipe(finalize(() => this.handleSelectAllContent())).subscribe()
        }
    }else {
      this.handleSelectAllContent()
    }
  }

  private handleSelectAllContent() {

    if (this.allSelected) {
      this.setSelectedFromTable = [];
      this.allSelected = false;
      this.wasAllSelectedInitially = false;
    } else {
      this.setSelectedFromTable = this.transactionsArray.map(t => ({
        id: t.transactionId,
        amount: t.senderAmount.amount
      }));
      this.allSelected = true;
      this.wasAllSelectedInitially = true;
    }
    this.selectedAmount = this.setSelectedFromTable.reduce((acc, cur) => acc + cur.amount, 0) / 100;
  }

  prepareSignPayload(): {
      includeTransactions: { id: string; mode: string }[];
      excludeTransactions: { id: string; mode: string }[];
      action: string;
      fileTransactionId: string;
    } {
      const totalCount = this.transactionsArray.length;
      const selectedCount = this.setSelectedFromTable.length;

      let includeTransactions: { id: string; mode: string }[] = [];
      let excludeTransactions: { id: string; mode: string }[] = [];

      // 1. HAMMASI TANLANGAN (Select All bosilgan va hech narsa remove qilinmagan)
      if (this.wasAllSelectedInitially && selectedCount === totalCount) {
        includeTransactions = [];
        excludeTransactions = [];
      }
      // 2. SELECT ALL BOSILGAN, LEKIN BA'ZILARINI OLIB TASHLAGAN
      else if (this.wasAllSelectedInitially && selectedCount < totalCount) {
        // Exclude = tanlanMAganlar
        const selectedIds = new Set(this.setSelectedFromTable.map(t => t.id));
        excludeTransactions = this.transactionsArray
          .filter(t => !selectedIds.has(t.transactionId))
          .map(t => ({ id: t.transactionId, mode: 'TRANSACTION' }));
        includeTransactions = [];
      }
      // 3. INDIVIDUAL TANLANGAN (Select All bosilmagan)
      else if (!this.wasAllSelectedInitially && selectedCount > 0) {
        includeTransactions = this.setSelectedFromTable.map(t => ({
          id: t.id,
          mode: 'TRANSACTION'
        }));
        excludeTransactions = [];
      }
      // 4. HECH NARSA TANLANMAGAN
      else {
        includeTransactions = [];
        excludeTransactions = [];
      }

      return {
        includeTransactions,
        excludeTransactions,
        action: 'SIGN_AND_SEND',
        fileTransactionId: this.transactionGroupUuid()
      };
    }

   handleMassiveSign () {
    const payload = this.prepareSignPayload();
    this._matDialog.open(HistorySignModalComponent, {
      data: {
        action: {
          isMassivePayment:true,
          massivePaymentData: payload,
          type: 'TRANSACTION',
          successMessage: this.translateService.instant('acc.sent_to_the_bank')
        },
        transactionId: 'mass',
        selectedAmount: this.selectedAmount,
        // transactionId: this.data.id,
        // transaction: this.data
      }
    }).afterClosed()
      .subscribe(() => {
        this.getTransactionReload("sign")
      }
      );
  }

  handleMassiveSignALl(event: any): void {
    const payload = this.prepareSignPayload();
    this._matDialog.open(EspSignConfirmComponent, {
      width: '744px',
      data: { action: {
          isMassivePayment:true,
          massivePaymentData:payload,
          type: 'TRANSACTION',
          successMessage: this.translateService.instant('acc.sent_to_the_bank')
        }
        },
    }).afterClosed()
      .subscribe();
  }

  setFilter(value: any) {
    this.filterChangeCount.update(v => ++v);
    this.reloading.set(true);
    this.filter = value;
    this._searchText$.next(value.searchText)

    if(this.filterChangeCount() > 1) {
      this.getCurrentTabsDatas().subscribe()
    }
  }

  getTransactionReload(event:string){
    if (event === 'sign'){
      this.getMassivePaymentFileStatistics(this.activatedRoute.snapshot.paramMap.get('id') as string)
      if(this.activeTabs() == 'all') {
        this.getPaymentImportFileData(this.paymentId()).subscribe()
        this.initFilters();
        return;
      }
      if (this.activeTabs() === 'signature') {
         this.getPaymentsSignature().subscribe()
        this.initFilters();
         return
      }
      if(this.activeTabs() == 'under-development') {
        this.getPaymentsUnderDevelopment().subscribe();
        this.initFilters();
        return;
      }
      if (this.activeTabs() === 'creation-errors') {
        this.getPaymentImportFileData(this.paymentId()).subscribe();
        this.initFilters();
        return;
      }
      this._cdRef.detectChanges();
    }
  }


  // !!TODO
  getTransactionReloadMain(event:string){
    if (event === 'sign'){
      if (this.activeTabs() === 'signature') {
        this.getPaymentsSignature().subscribe()
        return;
      }else if(this.activeTabs() == 'under-development') {
         this.getPaymentsUnderDevelopment().subscribe()
        return;
      }

      this._cdRef.detectChanges();
    }
  }

  checkUrl() {
    return window.location.pathname === '/history';
  }

  private setStartOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return this.normalizeLocalTime(d);
  }

  private setEndOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return this.normalizeLocalTime(d);
  }

  private normalizeLocalTime(date: Date): Date {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  }




  protected readonly Object = Object;
  protected readonly JSON = JSON;
  protected readonly Number = Number;



  readonly CREATED_PAYMENTS_TABS = CREATED_PAYMENTS_TABS

}
