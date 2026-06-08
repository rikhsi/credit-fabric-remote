import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { BackendResponse } from 'src/app/core/models/backend-response.model';
import { SessionService } from 'src/app/core/services/session.service';
import { environment } from 'src/environments/environment';

import {
  AccountInfoDto, AccountsDto,
  AccountsList,
  BannerList, DailyTransaction, PurposeContent, TemplateList, TransactionContent,
  TransactionListDto,
  TransactionStatusItem
} from '../models/accounts-payments.model';
import { IStatementsDto } from '../models/statements.interface';
import { LoanTypes } from '../../loans/models/loan.model';
import { CorpCardTransactionResponse } from '../../corp-card-project/model/transaction-history.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsPaymentsService {
  private API_URL = `${environment.API_BASE}`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) {
  }

  checkPaymentAllowed(data: {
    recipientAccount: string | null,
    senderAccount: string | null,
    transactionMode: string,
  }): Observable<{ msg: string }  | null> {
    return this._http.post<BackendResponse<{ msg: string } | null>>(`${this.API_URL}/api/account-transaction/v1/check-payment/check-payment-allowed`,{
      ...data
    }).pipe(
      map(this._sessionService.handleResponse<{ msg: string } | null>)
    );
  }

  pinTemplate(data: { transactionId: string, pin: boolean, pinOrder: number | null  }): Observable<BannerList | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/saved-payment/pin`,data).pipe(
      map(this._sessionService.handleResponse<BannerList>),
      catchError(this._sessionService.handleError)
    );
  }

  getTransactionDocNum() {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/payment/get/doc-number`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

   getPaymentTransactionDocNum() {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/payment/get/doc-number`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getAccountTransactionDocNum() {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/payment/get/doc-number`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getSpecialCodes() {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/core/bic/codes`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getPaymentAllowed(
    pageable: {size: number, page: number},
    data: {
      senderAccount: string | null,
      transactionMode: string | null,
      accountType?:string,
      currency?: string,
    }): Observable<AccountsList | null> {
    return this._http.post<BackendResponse<AccountsList | null>>(`${this.API_URL}/core/check-payment/get-payment-allowed`,{
      ...pageable,
      ...data
    }).pipe(
      map(this._sessionService.handleResponse<AccountsList | null>),
      catchError(this._sessionService.handleError)
    );
  }

  getLoanAccountsAllowed(id: string, type: LoanTypes): Observable<AccountsDto[] | null> {
    return this._http.get<BackendResponse<AccountsDto[] | null>>(`${this.API_URL}/core/credit/customer/loan/accounts/${id}?type=${type}`).pipe(
      map(this._sessionService.handleResponse<AccountsDto[] | null>)
    );
  }

  getPurposes(data?: { page: number, size: number, searchText: string }): Observable<PurposeContent[]| null> {
    const s = data?.size ? `?size=${data.size}` : '';
    const p = data?.size ? `&page=${data.page}` : '';
    const searchText = data?.searchText ? `&searchText=${data.searchText}` : '';
    const q = s + p + searchText;
    return this._http.get<BackendResponse<PurposeContent[]>>(`${this.API_URL}/core/payment/purpose${q}`).pipe(
      map(this._sessionService.handleResponse<PurposeContent[]>),
      catchError(this._sessionService.handleError)
    );
  }
  getOfferUrl(type: string): Observable<any> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/core/file/get-offer-url?type=${type}`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  getBankInfo(bankMfo: string): Observable<any> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/account/v1/bank-info/get/info?mfo=${bankMfo}`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  getBanners(param = 1): Observable<BannerList | null> {
    return this._http.post<BackendResponse<BannerList>>(`${this.API_URL}/core/banner/get/all`,{param}).pipe(
      map(this._sessionService.handleResponse<BannerList>),
      catchError(this._sessionService.handleError)
    );
  }
  deleteSavedTransactions(id:string): Observable<{ msg:string } | null> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/core/payment/request/delete-saved-uzs-transaction`,{id}).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    );
  }
  createAccount(data:any): Observable<{ msg:string } | null> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/core/account/open`,data).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    );
  }
  getAccountTypes() {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/core/account/open/account/types`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getCurrencies(params?: { currencyType?: string, senderCurrency?: string }) {
    const queryParams = new URLSearchParams();

    if (params?.currencyType) {
      queryParams.append('currencyType', params.currencyType);
    }
    if (params?.senderCurrency) {
      queryParams.append('senderCurrency', params.senderCurrency);
    }

    const url = `${this.API_URL}/core/currency/get/types?${queryParams.toString()}`;

    return this._http.get<BackendResponse<any>>(url).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  saveTransaction(payload:{transactionId:string,name:string}): Observable<{ msg:string } | null> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/core-transaction/v1/saved-payment/save/uzs-transaction`,payload).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>)
    );
  }

  editSavedUzsPayment(id: string, data: any): Observable<{ msg:string } | null> {
    return this._http.put<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/core-transaction/v1/payment/edit/transaction/${id}`,data).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>)
    );
  }
  editSavedBudgetPayment(data: any): Observable<{ msg:string } | null> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/account-transaction/v1/budget/request/change-saved-budget-transaction`,data).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>)
    );
  }

  getSavedPaymentDetails(id: string): Observable<any> {
    return this._http.get<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/core-transaction/v1/saved-payment/get/transaction-one?id=${ id }`).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
    );
  }
  getSavedBudgetDetails(id: string): Observable<any> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/account-transaction/v1/budget/request/saved-budget-one`, { id }).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
    );
  }

  getMfoList(data: { bankBranchCode: string | null, search: string | null, page: number, size: number }): Observable<any> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/account/v1/bank-info/search-bank-info`, data).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
    );
  }

  getMfoDetails(query = ''): Observable<{ msg: string } | null> {
    return this._http.get<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/api/account/v1/bank-info/get/info?mfo=${query}`).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    )
  }


  deleteSavedPayment(id: string) {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/account-transaction/v1/payment/request/delete-saved-uzs-transaction`, { id }).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    );
  }
  deleteTemplate(id: string) {
    return this._http.delete<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/core-transaction/v1/saved-payment/delete/${id}`).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    );
  }
  deleteBudgetPayment(id: string) {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/account-transaction/v1/budget/request/delete-saved-budget-transaction`, { id }).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    );
  }

  deletePreparedTransaction(id:string | string[], isArray = false): Observable<{ msg:string } | null> {
    const ids = isArray ? id : [id];
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/core/payment/delete/transaction-list`, { ids }).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    );
  }

  getTransactionStatusList():Observable<TransactionStatusItem[] | null> {
    return this._http.get<BackendResponse<TransactionStatusItem[]>>(`${this.API_URL}/api/core-transaction/v1/payment/get/transaction/status/list`).pipe(
        map(this._sessionService.handleResponse<TransactionStatusItem[]>),
      );
  }
  getTransactionList(paging:{page:number,size:number}, filter: {
      endDate: string | null,
      startDate: string | null,
      statuses: (string | null)[] | null,
      docNum?: string,
      transactionModes: (string | null)[] | null,
      parentId?: number,
      fullHistory?: boolean,
      searchText?: string,
    }): Observable<TransactionListDto | null> {
    return this._http.post<BackendResponse<TransactionListDto>>(
      `${this.API_URL}/api/core-transaction/v1/payment/get/transaction/list`, {
        ...filter,
        ...paging
      })
      .pipe(
        map(this._sessionService.handleResponse<TransactionListDto>),
      );
  }

   getCardTransactionList(paging:{page:number,size:number},
    filter:{uuid:string}): Observable<CorpCardTransactionResponse | null> {
    return this._http.post<BackendResponse<CorpCardTransactionResponse>>(
      `${this.API_URL}/api/salary-card/v1/card/all/history`, {
        paging: {
         ...paging
        },
        ...filter,
      })
      .pipe(
        map(this._sessionService.handleResponse<CorpCardTransactionResponse>)
      );
  }

  getTransactionListV2(paging:{page:number,size:number},
                     filter:{receiverAccount: string | null, searchText: string | null, transactionStepFilter: string | null, receiverName: string | null, senderAccount: string | null, foreignCurrency: boolean | null, type: string, currency: string | null, fromAmount: number | null, inn: string | null, fullHistory: boolean, toAmount: null | number,  endDate:string | null,startDate:string | null, statuses: (string | null)[] | null,docNum?:string | null, transactionModes: (string | null)[] | null , parentId?:number | null, windowType: string[] | null}): Observable<TransactionListDto | null> {
    return this._http.post<BackendResponse<TransactionListDto>>(
      `${this.API_URL}/api/core-transaction/v1/payment/get/transaction/list`, {
        ...filter,
        ...paging
      })
      .pipe(
        map(this._sessionService.handleResponse<TransactionListDto>)
      );
  }


  getBudgetListV2(paging:{page:number,size:number},
                       params:{}): Observable<TemplateList | null> {
    return this._http.post<BackendResponse<TemplateList>>(
      `${this.API_URL}/api/account-transaction/v1/budget/request/saved-budget-list`, {
        paging,
        params
      })
      .pipe(
        map(this._sessionService.handleResponse<TemplateList>)
      );
  }

  prepareUzsTransaction(data: any):Observable<{ id:string } | null> {
    return this._http.post<BackendResponse<{id:string}>>(`${this.API_URL}/api/account-transaction/v1/payment/prepare-uzs-transaction`, data).pipe(
      map(this._sessionService.handleResponse<{id:string}>)
    )
  }


  preparePreErrorTransaction(id: string, data: any):Observable<{ id:string } | null> {
    return this._http.put<BackendResponse<{id:string}>>(`${this.API_URL}/api/core-transaction/v1/payment/edit/file-transaction-row/prepare/${id}`, data).pipe(
      map(this._sessionService.handleResponse<{id:string}>)
    )
  }

  checkPaymentTransaction(data: any):Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/payment/check`, data).pipe(
      map(this._sessionService.handleResponse<any>)
    )
  }
  prepareCardTransaction(data: any):Observable<{ id:string } | null> {
    return this._http.post<BackendResponse<{id:string}>>(`${this.API_URL}/api/account-transaction/v1/physical/card/transaction/prepare`, data).pipe(
      map(this._sessionService.handleResponse<{id:string}>)
    )
  }
  editCardTransaction(data: any):Observable<{ id:string } | null> {
    return this._http.post<BackendResponse<{id:string}>>(`${this.API_URL}/api/account-transaction/v1/physical/card/transaction/edit`, data).pipe(
      map(this._sessionService.handleResponse<{id:string}>)
    )
  }
  prepareCorpCardTransaction(data: any):Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/salary-card/v1/card/all/card/transaction/prepare`, data).pipe(
      map(this._sessionService.handleResponse<any>)
    )
  }
  editCorpCardTransaction(data: any):Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/salary-card/v1/card/all/card/transaction/edit`, data).pipe(
      map(this._sessionService.handleResponse<any>)
    )
  }
  prepareBudgetTransaction(data: any):Observable<{ id:string } | null> {
    return this._http.post<BackendResponse<{id:string}>>(`${this.API_URL}/api/account-transaction/v1/budget/prepare-budget-transaction`, data).pipe(
      map(this._sessionService.handleResponse<{id:string}>)
    )
  }

  savePrepareUzsTransaction(data: any):Observable<{ id:string } | null> {
    return this._http.post<BackendResponse<{id:string}>>(`${this.API_URL}/api/account-transaction/v1/payment/save-uzs-transaction`, data).pipe(
      map(this._sessionService.handleResponse<{id:string}>)
    )
  }
  savePrepareBudgetTransaction(data: any):Observable<{ id:string } | null> {
    return this._http.post<BackendResponse<{id:string}>>(`${this.API_URL}/api/account-transaction/v1/budget/save-budget-transaction`, data).pipe(
      map(this._sessionService.handleResponse<{id:string}>)
    )
  }
  getTransactionTemplateDetails(id: string):Observable<TransactionContent> {
    return this._http.post<BackendResponse<TransactionContent>>(`${this.API_URL}/api/account-transaction/v1/payment/request/saved-uzs-one`, { id }).pipe(
      map(this._sessionService.handleResponse<TransactionContent>)
    )
  }
  getBudgetTemplateDetails(id: string):Observable<TransactionContent> {
    return this._http.post<BackendResponse<TransactionContent>>(`${this.API_URL}/api/account-transaction/v1/budget/request/saved-budget-one`, { id }).pipe(
      map(this._sessionService.handleResponse<TransactionContent>)
    )
  }

  confirmTransaction(confirmCode: string, externalId: string) {
    return this._http.post(`${this.API_URL}/core/sign/confirm `, {confirmCode, externalId}).pipe(
      catchError(this._sessionService.handleError)
    )
  }

  deleteAccount(accountNumber: string[], closeReason: string): Observable<{msg: string} | null> {
    return this._http.post<BackendResponse<{msg: string}>>(`${this.API_URL}/core/account/close`, { accountNumber, closeReason }).pipe(
      map(this._sessionService.handleResponse<{msg: string}>),
      catchError(this._sessionService.handleError)
    );
  }

  getReference(type: string): Observable<{msg: string} | null> {
    return this._http.post<BackendResponse<{msg: string}>>(`${this.API_URL}/core/documents/get/reference`, { type }).pipe(
      map(this._sessionService.handleResponse<{msg: string}>),
      catchError(this._sessionService.handleError)
    );
  }
  getTotalBalance(query = ''): Observable<{ msg: string } | null> {
    return this._http.get<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/account/get/total-balance${query}`).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    )
  }

  getDailyTransaction(): Observable<DailyTransaction | null> {
    return this._http.get<BackendResponse<DailyTransaction>>(`${this.API_URL}/api/account/v1/get/get-daily-transaction`).pipe(
      map(this._sessionService.handleResponse<DailyTransaction>),
      catchError(this._sessionService.handleError)
    )
  }

  fileUpload(file: any): Observable<{attachmentId:string,downloadUrl:string,previewUrl:string} | null> {
    const formData = new FormData()
    formData.append('file', file, file.name)
    return this._http.post<BackendResponse<{attachmentId:string,downloadUrl:string,previewUrl:string}>>(`${this.API_URL}/core/file/upload`, formData).pipe(
      map(this._sessionService.handleResponse<{attachmentId:string,downloadUrl:string,previewUrl:string}>),
      catchError(this._sessionService.handleError)
    )
  }

  paymentKartotekaFull(data: {
    id: null;
    docNum: string;
    cardId: number;
    sumLimit: number;
    restSum: number;
    purposeName: string;
    purposeCode: any;
    clAcc: any;
    coAcc: any;
    coMfo: string;
    coName: string;
    coInn: any;
    docDate: string;
  }): Observable<{ msg:string } | null> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/account-transaction/v1/bank-mail/doc/pay`,data).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>)
    );
  }
}
