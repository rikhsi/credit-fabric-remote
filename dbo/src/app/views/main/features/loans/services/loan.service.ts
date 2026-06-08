import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { BackendResponse } from 'src/app/core/models/backend-response.model';
import { SessionService } from 'src/app/core/services/session.service';
import { environment } from 'src/environments/environment';

import {
  ILoanProduct, Loan,
  LoanApplicationDto, LoanDetail,
  LoanDownloadUrl,
  LoanDto, LoanHistoryDto, LoanSchedule,
  PagableResponse,
  PageRequest,
  PreparePaymentRequest, RequestToLoan,
} from '../models/loan.model';
import { LoanDetailDto, OneLoanResDto, PrepareLoanTransactionReqDto } from '../../loan/models/loan.modal';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private API_URL = `${environment.API_BASE}`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) {}


  private _isLoanEmpty$$ = new BehaviorSubject<boolean>(false)
  public isLoanEmpty$$ = this._isLoanEmpty$$.asObservable()
  activeTab = signal<'my' | 'closed'>('my')


  setIsLoanEmpty(value:boolean) {
    this._isLoanEmpty$$.next(value)
  }


  prepareLoanTransaction(body:PrepareLoanTransactionReqDto) :Observable<any>{
        return this._http.post<{id:string}>(`${this.API_URL}/api/account-transaction/v1/payment/prepare-loan-transaction`,body)
  }


 


getLoanList(params?: {
  status?: 'OPEN' | 'CLOSE';
  startDate?: string;
  endDate?: string;
  searchText?: string;
  currency?: string;
  page?: number;
  size?: number;
}) {
  let httpParams = new HttpParams();
  if (this.activeTab() === 'closed') {
    httpParams = httpParams.set('status', 'CLOSE');
  } else  {
    httpParams = httpParams.set('status', 'OPEN');
  }

  if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
  if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
  if (params?.searchText) httpParams = httpParams.set('searchText', params.searchText);
  if (params?.currency) httpParams = httpParams.set('currency', params.currency);
  // if (params?.page !== undefined) httpParams = httpParams.set('page', params.page);
  // if (params?.size !== undefined) httpParams = httpParams.set('size', params.size);

  return this._http.get<BackendResponse<{content: Loan[], totalCount: number}>>(
    `${this.API_URL}/api/deposit-credit/v1/credit/loans`,
    { params: httpParams }
  ).pipe(
    map(this._sessionService.handleResponse<{content: Loan[], totalCount: number}>),
    catchError(this._sessionService.handleError)
  );
}
  getPinnedLoanList() {
    return this._http.get<BackendResponse<{content: Loan[]}>>(
      `${this.API_URL}/api/deposit-credit/v1/credit/loans/pin`
    ).pipe(
      map(this._sessionService.handleResponse<{content: Loan[]}>),
      catchError(this._sessionService.handleError)
    );
  }

  getTotalBalance(currency: string = 'UZS') {
    return this._http.get<BackendResponse<{totalBalance: any, currencyListObj: any}>>(
      `${this.API_URL}/api/deposit-credit/v1/credit/loans/total?currency=${currency}`
    ).pipe(
      map(this._sessionService.handleResponse<{totalBalance: any, currencyListObj: any}>),
      catchError(this._sessionService.handleError)
    );
  }
  // getLoanList(): Observable<LoanDto[] | null> {
  //   return this._http.get<BackendResponse<LoanDto[]>>(`${this.API_URL}/api/deposit-credit/v1/credit/request/search-loan`).pipe(
  //     map(this._sessionService.handleResponse<LoanDto[]>)
  //   );
  // }
  getLoanDetail(loanId:string): Observable<LoanDetailDto | null> {
    return this._http.post<BackendResponse<LoanDetailDto>>(`${this.API_URL}/api/deposit-credit/v1/credit/loans/detail`,{loanId}).pipe(
      map(this._sessionService.handleResponse<LoanDetailDto>),
      catchError(this._sessionService.handleError)
    );
  }

 getOneLoan(loanId:string): Observable<OneLoanResDto | null> {
    return this._http.post<BackendResponse<OneLoanResDto>>(`${this.API_URL}/api/deposit-credit/v1/credit/loans/one`,{loanId}).pipe(
      map(this._sessionService.handleResponse<OneLoanResDto>),
      catchError(this._sessionService.handleError)
    );
  }

  
  pinLoan(loanId:string) {
    return this._http.post<BackendResponse<PagableResponse<ILoanProduct>>>(`${this.API_URL}/api/deposit-credit/v1/credit/create/pin`,  { loanId }).pipe(
      map(this._sessionService.handleResponse<PagableResponse<ILoanProduct>>)
    );
  }
  unPinLoan(loanId:string) {
    return this._http.post<BackendResponse<PagableResponse<ILoanProduct>>>(`${this.API_URL}/api/deposit-credit/v1/credit/unpin`,  { loanId }).pipe(
      map(this._sessionService.handleResponse<PagableResponse<ILoanProduct>>)
    );
  }



  getLoanHistoryLink(data: any): Observable<LoanHistoryDto | null> {
    let filterQuery = '';
    for(const [key, val] of Object.entries(data)) {
      if(val)
      filterQuery += `${key}=${val}&`
    }
    return this._http.get<BackendResponse<LoanHistoryDto>>(`${this.API_URL}/core/credit/history?${filterQuery.slice(0, -1)}`).pipe(
      map(this._sessionService.handleResponse<LoanHistoryDto>),
      catchError(this._sessionService.handleError)
    );
  }

  depositCreditGraphic(loanId:string):Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/deposit-credit/v1/credit/graphic`,{loanId}).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getLoanSchedule(loanId: number): Observable<LoanSchedule | null> {
    return this._http.get<BackendResponse<LoanSchedule>>(`${this.API_URL}/core/credit/customer/loan/schedule/${loanId}`).pipe(
      map(this._sessionService.handleResponse<LoanSchedule>),
      catchError(this._sessionService.handleError)
    );
  }

  getAllAvailableLoans(payload: PageRequest): Observable<PagableResponse<ILoanProduct> | null> {
    return this._http.post<BackendResponse<PagableResponse<ILoanProduct>>>(`${this.API_URL}/core/credit/get/all/loan-products`, payload).pipe(
      map(this._sessionService.handleResponse<PagableResponse<ILoanProduct>>)
    );
  }

  getAllLoanProposals(payload: PageRequest): Observable<PagableResponse<LoanApplicationDto> | null> {
    return this._http.post<BackendResponse<PagableResponse<LoanApplicationDto>>>(`${this.API_URL}/core/credit/proposals`, payload).pipe(
      map(this._sessionService.handleResponse<PagableResponse<LoanApplicationDto>>),
      catchError(this._sessionService.handleError)
    );
  }

  getLoanInfo(id: string): Observable<ILoanProduct | null> {
    return this._http.get<BackendResponse<ILoanProduct>>(`${this.API_URL}/core/credit/get/loan-product/${id}`, {}).pipe(
      map(this._sessionService.handleResponse<ILoanProduct>),
      catchError(this._sessionService.handleError)
    );
  }

  preparePayment(payload: PreparePaymentRequest): Observable<{ id: string } | null> {
    return this._http.post<BackendResponse<{ id: string }>>(`${this.API_URL}/core/credit/prepare/payment`, payload).pipe(
      map(this._sessionService.handleResponse<{ id: string }>)
    );
  }

  requestToLoanApplication(data:RequestToLoan): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/core/credit/request-loan`, data).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  // loanPayment(data: any) {
  //   let headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     Mode: 'dev',
  //     Authorization: 'Basic YWRtaW46MUptdENqcERhbW1vc1Y0OFA5',
  //   });
  //   let options = { headers: headers };
  //   return this.http.post('http://10.11.38.1:8000/api/belt', data, options);
  // }

  // exportLoanDetailToExcel(data: LoanDetail) {
  //   const formatted = [{
  //     'ID': data.loanId,
  //     'Статус': data.status,
  //     'Ссудный счет': data.loan1,
  //     'Сумма кредита': +data.totalAmount.amount/100,
  //     'Процентная ставка': data.percent,
  //     'Дата следующего платежа': data.repaymentDate,
  //     'Остаток основного долга': +data.mainDebt?.amount/100,
  //     'Начисленные проценты': +data.interestAmount?.amount/100,
  //     'Пеня': +data.penalty?.amount/100,
  //     'Просроченный основной долг': +data.overdueAmount?.amount/100,
  //     'Просроченные проценты': +data.overPercentage?.amount/100,
  //     'Сумма следующего платежа': +data.repaymentAmount?.amount/100,
  //     'В том числе основной долг': +data.repaymentAmountMain?.amount/100,
  //     'Проценты': +data.percentageDebt?.amount/100,
  //     'Дата окончания': data.closeDate,
  //     'Льготный период': data.gracePeriod || '-',
  //   }];
  //
  //   const worksheet = XLSX.utils.json_to_sheet(formatted);
  //
  //   const columnNames = Object.keys(formatted[0]);
  //
  //   const columnWidths = columnNames.map(name => {
  //     const maxLength = Math.max(
  //       name.length,
  //       ...formatted.map(obj => String((obj as any)[name] || '').length)
  //     );
  //
  //     return { width: maxLength + 2 };
  //   });
  //
  //   worksheet['!cols'] = columnWidths;
  //
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Accounts');
  //   const fileName = `loan-info-${new Date().getTime()}.xlsx`
  //
  //   XLSX.writeFile(workbook, fileName);
  // }

  getMockLoanSchedule(uuid: string) {
    return of([
      {
        id: 0,
        status: 'ACTIVE',
        paymentDate: '15.01.2025',
        scheduledAmount: 173551949,
        principalAmount: 100000049,
        interestAmount: 73551949,
        remainingBalance: 9888837800,
        currency: 'USZ'
      },
      {
        id: 1,
        status: 'ACTIVE',
        paymentDate: '15.01.2025',
        scheduledAmount: 173551949,
        principalAmount: 100000049,
        interestAmount: 73551949,
        remainingBalance: 9888837800,
        currency: 'USZ'
      }
    ]);
  }
}
