import {DestroyRef, Injectable} from '@angular/core';
import {catchError, EMPTY, map, Observable, take} from 'rxjs';
import {
  BudgetAccountReferenceDto,
  CheckServicePayload,
  MunisCategoryListDto,
  MunisCreatePayload,
  MunisListItem,
  OfficeServiceRes,
  PurposeContent,
  ServiceDTO,
  TCodePurpose, TransactionContent,
  TransactionListDto
} from '../../views/main/features/accounts-payments/models/accounts-payments.model';
import {BackendResponse} from '../models/backend-response.model';
import {HttpClient} from '@angular/common/http';
import {SessionService} from './session.service';
import {environment} from '../../../environments/environment';
import {PagableResponse} from '../../views/main/features/loans/models/loan.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  SaveTransactionComponent
} from '../../views/main/features/accounts-payments/components/save-transaction/save-transaction.component';
import {EspSignConfirmComponent} from '../components/esp-sign-confirm/esp-sign-confirm.component';
import {AccountsPaymentsService} from '../../views/main/features/accounts-payments/services/accounts-payments.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {MatDialog} from '@angular/material/dialog';
import {EspSignConfirmService} from './esp-confirm.service';
import {UtilsService} from './utils.service';
import {AgreeModalComponent} from '../../shared/components/agree-modal/agree-modal.component';
import {PaymentSuccessModalComponent} from "../../shared/components/payment-success-modal/payment-success-modal";
import {TemplateSuccessModalComponent} from "../../shared/components/template-success-modal/template-success-modal";
import {Params} from "../../views/main/features/my-office/office/types/my-office.type";
import {FirebaseAnalyticsService} from "../../../../firebase-analytics.service";


export enum PurposeTypes {
  PAYMENT_UZS = 'PAYMENT_UZS',
  PAYMENT_CURRENCY = 'PAYMENT_CURRENCY',
  BUDGET_INCOME = 'BUDGET_INCOME',
  BUDGET = 'BUDGET',
  PHYSICAL_CARD = 'PHYSICAL_CARD'
}

/** POST /api/account-transaction/v1/bank-mail/create/ept/document */
export interface CreateEptBankMailDocumentPayload {
  id?: string;
  detail: string;
  docDate: string;
  docNumber: number;
  payeeAccount: string;
  payeeBranch: string;
  payeeInn: string;
  payeeName: string;
  payeePin: string;
  payerAccount: string;
  payerBranch: string;
  payerInn: string;
  payerName: string;
  paymentType: string;
  purpose: { code: string; name: string };
  summa: number;
  unpaid: string;
}
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private API_URL = `${environment.API_BASE}`;

  constructor(
    private _http: HttpClient,
    private dialog: MatDialog,
    private _sessionService: SessionService,
    private accountsPaymentService: AccountsPaymentsService,
    private destroyRef: DestroyRef,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private matDialog: MatDialog,
    private espConfirmService: EspSignConfirmService,
    private utilsService: UtilsService,
    private analyticsService: FirebaseAnalyticsService,
  ) {
  }

  checkIsFromTemplate(id: string) {
    const fromQuery = 'templates'
    if (id) {
      let dialog = this.matDialog.open(SaveTransactionComponent, {
        disableClose: true,
        data: id
      })
      dialog.componentInstance.save
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          dialog.close();
          this.accountsPaymentService
            .deletePreparedTransaction(id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((val) => {
              this.router.navigate([`/${fromQuery}`]);
            });
        })
    }
  }

  handleDuplicateDocNumber(body: any, type: string, fromQuery: string, message: string) {
    this.toastrService.error('Такой номер документа уже существует')
  }

  createTransaction(body: any, type: string, fromQuery: string, parent?: any) {
    // if (body.isAutoPay) {
    //   this.createAutoPay(body, type, fromQuery);
    //   return;
    const mode = this.route.snapshot.queryParamMap.get('mode');
    if (!body.docNum) {
      this.toastrService.error('Не указан номер документа!');
      return;
    }
    if (parent?.massDocDate && parent?.massDocDate()) {
      if (mode === 'mass') {
        body.withAnor = body.type === '321'
        delete body.detail;
        delete body.balance
        delete body.isAnor;
        delete body.isAutoPay;
        delete body.isSaved;
        delete body.type;
        delete body.windowType;
        delete body.transactionMode;
        this.preparePreErrorTransaction(body)
       }
      }
     else {
      this.prepareTransaction(body, type, fromQuery, parent);
    }
  }

  // createAutoPay(body: any, type: string, fromQuery: string) {
  //   this.prepareTransaction(body, type, fromQuery);
  // }

  preparePreErrorTransaction(body: any) {
    const id = this.route.snapshot.queryParamMap.get('transactionId');
    const url = this.route.snapshot.queryParamMap.get('returnUrl');


    this.accountsPaymentService.preparePreErrorTransaction(id as string, body)
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(err => {
        // parent.getDocDate()
        this.utilsService.spinnerState$$.next(false);
        this.toastrService.error(err.message || err);
        return EMPTY
      }))

      .subscribe({
        next: (res) => {
          if (res) {
            this.toastrService.success('Изменен', 'Успешно')
            this.router.navigateByUrl(url as string);
            // if (type === 'SAVE') {
            //   if (fromQuery === 'templates') {
            //     this.checkIsFromTemplate(res.id);
            //   } else if (fromQuery == 'autopay') {
            //     this.toastrService.success('Автоплатёж создан!');
            //     this.router.navigate(['templates'], {
            //       queryParams: {
            //         tab: 'AUTO_PAYMENTS'
            //       }
            //     });
            //   } else {
            //     this.dialog.open(PaymentSuccessModalComponent, {
            //       data: {
            //         ...body,
            //         transactionId: res.id
            //       },
            //       disableClose: true,
            //     });
            //   }
            // }
          }
          // if (type === 'SEND' && res?.id) {
          //   this.sendPayment(res.id);
          // }
        },
        error: (err: any) => {
          // parent.getDocDate()
          this.utilsService.spinnerState$$.next(false);
          this.toastrService.error(err.message || err);
        }
      });
  }


  prepareTransaction(body: any, type: string, fromQuery: string, parent?: any) {
    const payload = body;
    if (!body.isSaved) {
      payload.isSaved = false;
    }
    if (!body.isAutoPay) {
      payload.isAutoPay = false;
    }
    this.accountsPaymentService.prepareUzsTransaction(payload)
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(err => {
        // parent.getDocDate()
        this.utilsService.spinnerState$$.next(false);
        this.toastrService.error(err.message || err);
        return EMPTY
      }))

      .subscribe({
        next: (res) => {
          if (res) {
            this.analyticsService.logFirebaseCustomEvent('create_payment_order_success', null);
            this.analyticsService.logFirebaseCustomEvent('create_payment_order_screen_jump', null);

            this.transferSuccessEvent(res)
            if (type === 'SAVE') {
              if (fromQuery === 'templates') {
                this.checkIsFromTemplate(res.id);
              } else if (fromQuery == 'autopay') {
                this.toastrService.success('Автоплатёж создан!');
                this.router.navigate(['templates'], {
                  queryParams: {
                    tab: 'AUTO_PAYMENTS'
                  }
                });
              } else {
                  this.dialog.open(PaymentSuccessModalComponent, {
                    data: {
                      ...body,
                      transactionId: res.id
                    },
                    disableClose: true,
                  });
              }
            }
          }
          if (type === 'SEND' && res?.id) {
            this.sendPayment(res.id);
          }
        },
        error: (err: any) => {
          this.analyticsService.logFirebaseCustomEvent('payment_failed', {platform: "web"});

          // parent.getDocDate()
          this.utilsService.spinnerState$$.next(false);
          this.toastrService.error(err.message || err);
        }
      });
  }
  transferSuccessEvent(item) {
    const currentUrl = this.router?.url;
    if (currentUrl && (currentUrl?.includes("/payment/transfer-to-account") || currentUrl?.includes("/payment/transfer-to-budget") || currentUrl?.includes("/payment/transfer-to-treasure"))) {
      this.analyticsService.logFirebaseCustomEvent('create_transfer_success', {transfer_id: item?.id || undefined});
    }

  }
  createTemplate(data: any, name?: string, modalRef?: any) {
    // data.isSaved = true;
    this.accountsPaymentService.prepareUzsTransaction(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res) {
            this.analyticsService.logFirebaseCustomEvent('create_template_success', null);
            if (modalRef) modalRef.templateCreateModal = false;
            // this.dialog.open(TemplateSuccessModalComponent, {
            //   data: []
            // });
            this.toastrService.success("Добавлен в раздел “Шаблоны”", "Шаблон сохранён");
            this.router.navigate(['/templates'])
          }
        },
        error: (err: any) => {
          this.toastrService.error(err || err.message || 'Что то понло не так...');
          this.utilsService.spinnerState$$.next(false);
        }
      });
  }

  createTemplateBudget(data: any, name: string) {
    // data.isSaved = true;
    this.utilsService.spinnerState$$.next(true);
    this.accountsPaymentService.savePrepareBudgetTransaction({ name: name, paymentToBudgetReq: data })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res) {
            this.toastrService.success("Шаблон успешно создан")
            this.router.navigate(['templates']);
          }
        },
        error: (err: any) => {
          this.toastrService.error(err || err.message || 'Что то понло не так...');
          this.utilsService.spinnerState$$.next(false);
        }
      });
  }

  editTemplateReq(data: any, templateId: string, type: 'transaction' | 'template' = 'template') {
    this.utilsService.spinnerState$$.next(true);
    this.accountsPaymentService.editSavedUzsPayment(templateId, data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if (res) {
            if (type === 'transaction') {
              this.dialog.open(PaymentSuccessModalComponent, {
                data: {...data, mode: 'edit', transactionId: res.id}
              });
            } else {
              this.toastrService.success('Добавлен в раздел "Шаблоны"', 'Шаблон сохранен');
              this.router.navigate(['/templates']);
              // this.dialog.open(TemplateSuccessModalComponent, {
              //   data: {mode: 'edit'}
              // });
            }
          }
        },
        error: (err: any) => {
          this.toastrService.error(err || err.message || 'Что то понло не так...');
          this.utilsService.spinnerState$$.next(false);
        }
      });
  }


  sendPayment(id: string, type = 'TRANSACTION') {
    this.espConfirmService.paymentSign({
      type,
      id,
      hash: ''
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res1) => {
        if (!res1) return
        this.matDialog.open(EspSignConfirmComponent, {
          width: '744px',
          data: { action: {...res1, externalId: id, type: 'TRANSACTION'}, transaction: {} },
        }).afterClosed()
          .subscribe(result => {
            this.router.navigate(['accounts-and-payments'], {
              queryParams: {
                tab: 'payments'
              }
            });
          });
      });
  }

  checkDocNumber(num: string) {
    const url = `${this.API_URL}/api/account-transaction/v1/payment/check/doc-number?docNumber=${num}`;
    this._http.get(url)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          if (!res.success) {
            this.toastrService.error('Такой номер документа уже существует')
          }
        },
        error: (err) => {
          this.utilsService.spinnerState$$.next(false);
          this.toastrService.error(err.errorMessage || err || 'Что-то пошло не так!');
        }
      });
  }

  createEptBankMailDocument(body: CreateEptBankMailDocumentPayload): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(
      `${this.API_URL}/api/account-transaction/v1/bank-mail/create/ept/document`,
      body
    ).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getPurposes(data?: { page: number, size: number, searchText: string, typePurpose?: string }, type: PurposeTypes = PurposeTypes.PAYMENT_UZS): Observable<PagableResponse<PurposeContent[]> | null> {
    const s = data?.size ? `?size=1000` : '';
    const p = data?.size ? `&page=${data.page}` : '';
    const t = `&purposeType=${data?.typePurpose ? data?.typePurpose : type }`;
    const searchText = data?.searchText ? `&searchText=${data.searchText}` : '';
    const q = s + p + searchText;
    return this._http.get<BackendResponse<PagableResponse<PurposeContent[]>>>(`${this.API_URL}/api/account-transaction/v1/payment/purpose${q}${t}`).pipe(
      map(this._sessionService.handleResponse<PagableResponse<PurposeContent[]>>),
      catchError(this._sessionService.handleError)
    );
  }
  getPurposesV2(): Observable<TCodePurpose | null> {
    return this._http.get<BackendResponse<TCodePurpose>>(`${this.API_URL}/api/account-transaction/v1/dictionary/code-purpose`).pipe(
      map(this._sessionService.handleResponse<TCodePurpose>),
      catchError(this._sessionService.handleError)
    );
  }
  getPurposesBudget(accountType: string): Observable<TCodePurpose | null> {
    return this._http.post<BackendResponse<TCodePurpose>>(`${this.API_URL}/api/account-transaction/v1/dictionary/budget-purpose-code`, { accountType }).pipe(
      map(this._sessionService.handleResponse<TCodePurpose>),
      catchError(this._sessionService.handleError)
    );
  }

  getPaymentDocNum() {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/payment/get/doc-number`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  getAccountReference(data: { account: string | null, branchCode?: string | null, search?: string, soato?: string, inn?: string, referenceIds?: [string], page: number, size: number }): Observable<BudgetAccountReferenceDto | null> {
    return this._http.post<BackendResponse<BudgetAccountReferenceDto>>(`${this.API_URL}/api/account/v1/reference`, data).pipe(
      map(this._sessionService.handleResponse<BudgetAccountReferenceDto>),
      catchError(this._sessionService.handleError)
    );
  }

  getAccountReferenceV2(data: { rbid?: string | null, account?: string | null, branchCode?: string | null, search?: string | null, soato?: string | null, inn?: string | null, referenceIds?: [string] | [], page: number, size: number }): Observable<BudgetAccountReferenceDto | null> {
    return this._http.post<BackendResponse<BudgetAccountReferenceDto>>(`${this.API_URL}/api/account/v1/reference`, data).pipe(
      map(this._sessionService.handleResponse<BudgetAccountReferenceDto>),
      catchError(this._sessionService.handleError)
    );
  }
  // getAccountReferenceV2(data:{rbid: string | null, account: string | null, branchCode?: string | null, search?: string | null, soato?: string | null, inn?: string | null, referenceIds?: [string] | [], page: number, size: number }) : Observable<BudgetAccountReferenceDto | null> {
  //   return this._http.post<BackendResponse<BudgetAccountReferenceDto>>(`${this.API_URL}/api/account/v1/reference`,data).pipe(
  //     map(this._sessionService.handleResponse<BudgetAccountReferenceDto>),
  //     catchError(this._sessionService.handleError)
  //   );
  // }

  getTransactionList(paging: { page: number, size: number },
    filter: { endDate: string | null, startDate: string | null, statuses: (string | null)[] | null, transactionModes: (string | null)[] | null }): Observable<TransactionListDto | null> {
    return this._http.post<BackendResponse<TransactionListDto>>(
      `${this.API_URL}/api/core-transaction/v1/payment/get/transaction/list`, {
      ...filter,
      ...paging
    })
      .pipe(
        map(this._sessionService.handleResponse<TransactionListDto>)
      );
  }

  getTransactionOne(id: string): Observable<TransactionContent | null> {
    return this._http.get<BackendResponse<TransactionContent>>(
      `${this.API_URL}/api/core-transaction/v1/payment/get/transaction?id=${id}`)
      .pipe(
        map(this._sessionService.handleResponse<TransactionContent>)
      );
  }
  getPurposeText(windowType: string): Observable<{ formMessage: string }> {
    return this._http.get<BackendResponse<{ formMessage: string }>>(
      `${this.API_URL}/api/account-transaction/v1/payment/get/purpose-form?windowType=${windowType}`)
      .pipe(
        map(this._sessionService.handleResponse<{ formMessage: string }>)
      );
  }

  getTransactionPreErrorStatus(id: string): Observable<{ status: string }> {
    return this._http.get<BackendResponse<{ status: string }>>(
      `${this.API_URL}/api/core-transaction/v1/payment/check/file/transaction/by/temporary?temporaryId=${id}`)
      .pipe(
        map(this._sessionService.handleResponse<{ status: string }>)
      );
  }

  getTransactionPreError(id: string): Observable<TransactionListDto | null> {
    return this._http.get<BackendResponse<TransactionListDto>>(
      `${this.API_URL}/api/core-transaction/v1/payment/get/file-transaction-row/detail?id=${id}`)
      .pipe(
        map(this._sessionService.handleResponse<TransactionListDto>)
      );
  }

  getMunisServices(body : {parentId: string | null}): Observable<{categories: MunisCategoryListDto[] | null}> {
    return this._http.post<BackendResponse<{categories: MunisCategoryListDto[] | null}>>(
      `${this.API_URL}/api/account-transaction/v1/payment/service/category-list`, body)
      .pipe(
        map(this._sessionService.handleResponse<{categories: MunisCategoryListDto[] | null}>)
      );
  }

  searchServiceMunis(body : {page: number, size: number, type: string | null, query: string, parentId: string | null}): Observable<any> {
    return this._http.post<BackendResponse<any>>(
      `${this.API_URL}/api/account-transaction/v1/payment/service/search`, body)
      .pipe(
        map(this._sessionService.handleResponse<{categories: MunisCategoryListDto[] | null}>)
      );
  }

  addServiceToOffice(body : {transactionUuid: string, officeUuid: string}): Observable<any> {
    return this._http.post<BackendResponse<any>>(
      `${this.API_URL}/api/account-transaction/v1/my/office/service/add-from-transaction`, body)
      .pipe(
        map(this._sessionService.handleResponse<any>)
      );
  }

  getMunisServicesOne(body : {id: string | null}): Observable<ServiceDTO> {
    return this._http.post<BackendResponse<ServiceDTO>>(
      `${this.API_URL}/api/account-transaction/v1/payment/service/one`, body)
      .pipe(
        map(this._sessionService.handleResponse<ServiceDTO>)
      );
  }

  editOfficeService(body : { uuid: string, params: any[] }): Observable<{ uuid: string, params: Params }> {
    return this._http.post<BackendResponse<{ uuid: string, params: Params }>>(
      `${this.API_URL}/api/account-transaction/v1/my/office/service/edit`, body)
      .pipe(
        map(this._sessionService.handleResponse<{ uuid: string, params: Params }>)
      );
  }


  getOfficeServicesOne(id: string): Observable<any> {
    return this._http.get<BackendResponse<any>>(
      `${this.API_URL}/api/account-transaction/v1/my/office/service/${id}`)
      .pipe(
        map(this._sessionService.handleResponse<any>)
      );
  }

  getStatusMain(status: string = 'SALARY'): Observable<any> {
    return this._http.get<BackendResponse<any>>(
      `${this.API_URL}/api/core-transaction/v1/payment/get/transaction/status/list/main`,
      { params: { status } }
    ).pipe(
      map(this._sessionService.handleResponse<any>)
    );
  }

  prepareMunisService(body : MunisCreatePayload): Observable<{id: string}> {
    return this._http.post<BackendResponse<{id: string}>>(
      `${this.API_URL}/api/account-transaction/v1/payment/prepare-munis-transaction`, body)
      .pipe(
        map(this._sessionService.handleResponse<{id: string}>)
      );
  }


  editMunisService(body: MunisCreatePayload, id: string): Observable<{id: string}> {
    return this._http.put<BackendResponse<{id: string}>>(
      `${this.API_URL}/api/core-transaction/v1/payment/edit/munis/transaction/${id}`, body)
      .pipe(
        map(this._sessionService.handleResponse<{id: string}>)
      );
  }

  createOfficeName(body : { name: string }): Observable<{id: string}> {
    return this._http.post<BackendResponse<{id: string}>>(
      `${this.API_URL}/api/account-transaction/v1/my/office`, body)
      .pipe(
        map(this._sessionService.handleResponse<{id: string}>)
      );
  }

  createOfficeService(body : { officeUuid: string, serviceUuid: string, params: {id: string, value: string, prefix?: string, suffix?: string}[] }): Observable<{id: string}> {
    return this._http.post<BackendResponse<{id: string}>>(
      `${this.API_URL}/api/account-transaction/v1/my/office/service`, body)
      .pipe(
        map(this._sessionService.handleResponse<{id: string}>)
      );
  }

 getMyOffice(): Observable<MunisListItem[] | null> {
    return this._http.get<BackendResponse<MunisListItem[]>>(`${this.API_URL}/api/account-transaction/v1/my/office/get/list`).pipe(
      map(this._sessionService.handleResponse<MunisListItem[]>),
      catchError(this._sessionService.handleError)
    );
  }

  getMyOfficeServices(body: { page: number, size: number, officeId: string }): Observable<OfficeServiceRes | null> {
    return this._http.post<BackendResponse<OfficeServiceRes>>(`${this.API_URL}/api/account-transaction/v1/my/office/service/get/list`, body).pipe(
      map(this._sessionService.handleResponse<OfficeServiceRes>),
      catchError(this._sessionService.handleError)
    );
  }

  deleteMyOffice(body: {id: string}) {
    return this._http.post<BackendResponse<{msg: string}>>(`${this.API_URL}/api/account-transaction/v1/my/office/delete`, body).pipe(
      map(this._sessionService.handleResponse<{msg: string}>),
      catchError(this._sessionService.handleError)
    );
  }
  deleteMyOfficeService(body: {id: string}) {
    return this._http.post<BackendResponse<{msg: string}>>(`${this.API_URL}/api/account-transaction/v1/my/office/service/delete`, body).pipe(
      map(this._sessionService.handleResponse<{msg: string}>),
      catchError(this._sessionService.handleError)
    );
  }

  editMyOffice(body: {uuid: string, name: string}) {
    return this._http.post<BackendResponse<{msg: string}>>(`${this.API_URL}/api/account-transaction/v1/my/office/edit`, body).pipe(
      map(this._sessionService.handleResponse<{msg: string}>),
      catchError(this._sessionService.handleError)
    );
  }


  MunisServicesCheck(body : {id: string, params: {id: string, value: string, prefix?: string, suffix?: string}[]}): Observable<CheckServicePayload> {
    return this._http.post<BackendResponse<CheckServicePayload>>(
      `${this.API_URL}/api/account-transaction/v1/payment/service/check`, body)
      .pipe(
        map(this._sessionService.handleResponse<CheckServicePayload>)
      );
  }


  deletePreparedTransaction(id: string | string[]): Observable<{ msg: string } | null> {
    let ids = Array.isArray(id) ? id : [id];
    return this._http.post<BackendResponse<{ msg: string }>>(`${this.API_URL}/core/payment/delete/transaction-list`, { ids }).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    );
  }
}
