import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { SessionService } from "./session.service";
import { catchError, map, Observable, tap } from "rxjs";
import { BackendResponse, Balance } from "../models/backend-response.model";
import { PageRequestWIthDate } from "../../views/main/features/corp-cards/models/corp-card.model";
import { EmployeeListDto } from "../../views/main/features/salary-project/salary-project.model";
import {
  PayrollProjectGroupResponseListDtoAll,
  PayrollProjectRequestToListDtoAll, PayrollProjectResponseContent,
  PayrollProjectResponseListDtoAll
} from "../../views/main/features/payroll-project/models/payroll-project.type";
import { TotalBalanceResponse } from 'src/app/views/main/features/main/interfaces/balance-accounts.interface';

@Injectable({
  providedIn: 'root'
})
export class SalaryProjectService {

  private API_URL = `${environment.API_BASE}`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService
  ) { }

  getSalaryExcelFile(data: { cardUuid?: string, page: number, size: number, userType: string, transitAccount?: string, contractNumber?: string }): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{ msg: string }>>(`${this.API_URL}/api/salary-card/v1/salary/all/generate/file`, data).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    )
  }

  getSalaryExcelFileWithStatus(uuid: string): Observable<{ msg: string } | null> {
    return this._http.get<BackendResponse<{ msg: string }>>(`${this.API_URL}/api/salary-card/v1/salary/all/generate/file/with-status?fileType=EXCEL&transactionUuid=${uuid}`).pipe(
      tap(res => res),
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    )
  }
  getSalaryPdfFileWithStatus(uuid: string): Observable<{ file: string } | null> {
    return this._http.get<BackendResponse<{ file: string }>>(`${this.API_URL}/api/salary-card/v1/receipt/generate/pdf/salary?id=${uuid}`).pipe(
      tap(res => res),
      map(this._sessionService.handleResponse<{ file: string }>),
      catchError(this._sessionService.handleError)
    )
  }

  blockCorpCard(payload: {id:string}): Observable<{ msg:string} | null> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/salary-card/v1/card/all/block-card`, payload).pipe(
      tap(res => res),
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    )
  }

  unBlockCorpCard(payload: {id:string}): Observable<{ msg:string} | null> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/salary-card/v1/card/all/unblock-card`, payload).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    )
  }

  removeLimit(payload: {id:string}): Observable<{ msg:string} | null> {
    return this._http.post<BackendResponse<{ msg:string }>>(`${this.API_URL}/api/salary-card/v1/card/all/remove-limit`, payload).pipe(
      map(this._sessionService.handleResponse<{ msg:string }>),
      catchError(this._sessionService.handleError)
    )
  }



  getCardsTotalBalance(data: { userType: "CORPORATE", currency: string }): Observable<Balance | null> {
    return this._http.post<BackendResponse<Balance>>(`${this.API_URL}/api/salary-card/v1/card/all/total-balance`, data).pipe(
      map(this._sessionService.handleResponse<Balance>),
      catchError(this._sessionService.handleError)
    );
  }

  unpinCard(cardId: string): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{ msg: string }>>(`${this.API_URL}/api/salary-card/v1/card/all/unpin`, { cardId }, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    );
  }
  createPinCard(cardId: string): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{ msg: string }>>(`${this.API_URL}/api/salary-card/v1/card/all/create/pin`, { cardId }, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    );
  }
  changeTitle(data: any): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{ msg: string }>>(`${this.API_URL}/api/salary-card/v1/card/title`, data).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    );
  }
  uploadRosterSalary(file: any, queryParams: { [key: string]: string }): Observable<string[] | null> {
    let params = new HttpParams({ fromObject: queryParams });


    const formData = new FormData();
    formData.append('file', file);

    return this._http.post<BackendResponse<string[]>>(
      `${this.API_URL}/api/salary-card/v1/salary/all/card/transaction/file/prepare/upload`,
      formData,
      { params }
    ).pipe(
      map(this._sessionService.handleResponse<string[]>),
      catchError(this._sessionService.handleError)
    );
  }

  getEmployees(data: { paging: { page: number, size: number }, params: {} }): Observable<EmployeeListDto | null> {
    return this._http.post<BackendResponse<EmployeeListDto>>(`${this.API_URL}/api/salary-card/v1/card/get-workers-list`, data).pipe(
      map(this._sessionService.handleResponse<EmployeeListDto>),
      catchError(this._sessionService.handleError)
    );
  }
  getEmployeesV2(paging: { page: number, size: number }, userType: string): Observable<EmployeeListDto | null> {
    return this._http.get<BackendResponse<EmployeeListDto>>(`${this.API_URL}/core/salary/all/get/employee?page=${paging.page}&size=${paging.size}&userType=${userType}`).pipe(
      map(this._sessionService.handleResponse<EmployeeListDto>),
      catchError(this._sessionService.handleError)
    );
  }
  syncAllPayrollProjectList(data: PayrollProjectRequestToListDtoAll): Observable<PayrollProjectResponseListDtoAll | null> {
    return this._http.post<BackendResponse<PayrollProjectResponseListDtoAll>>(`${this.API_URL}/api/salary-card/v1/card/all/sync`, data).pipe(
      map(this._sessionService.handleResponse<PayrollProjectResponseListDtoAll>),
      catchError(this._sessionService.handleError)
    );
  }

  getAllPayrollProjectList(data: PayrollProjectRequestToListDtoAll): Observable<PayrollProjectResponseListDtoAll | null> {
    return this._http.post<BackendResponse<PayrollProjectResponseListDtoAll>>(`${this.API_URL}/api/salary-card/v1/card/all`, data, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
      map(this._sessionService.handleResponse<PayrollProjectResponseListDtoAll>),
      catchError(this._sessionService.handleError)
    );
  }

  getCardBalance(data: PayrollProjectRequestToListDtoAll): Observable<PayrollProjectResponseListDtoAll | null> {
    return this._http.post<BackendResponse<PayrollProjectResponseListDtoAll>>(`${this.API_URL}/api/salary-card/v1/card/all/total-balance`, data).pipe(
      map(this._sessionService.handleResponse<PayrollProjectResponseListDtoAll>),
      catchError(this._sessionService.handleError)
    );
  }
  getPinnedCards(): Observable<PayrollProjectResponseListDtoAll | null> {
    return this._http.get<BackendResponse<PayrollProjectResponseListDtoAll>>(`${this.API_URL}/api/salary-card/v1/card/all/pin/list`, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
      map(this._sessionService.handleResponse<PayrollProjectResponseListDtoAll>),
      catchError(this._sessionService.handleError)
    );
  }

  getAllPayrollProjectGroupList(data: PayrollProjectRequestToListDtoAll): Observable<PayrollProjectGroupResponseListDtoAll | null> {
    return this._http.post<BackendResponse<PayrollProjectGroupResponseListDtoAll>>(`${this.API_URL}/api/salary-card/v1/salary/all/group`, data).pipe(
      map(this._sessionService.handleResponse<PayrollProjectGroupResponseListDtoAll>),
      catchError(this._sessionService.handleError)
    );
  }

  syncEmployees(): Observable<{ msg: string } | null> {
    return this._http.get<BackendResponse<{ msg: string }>>(`${this.API_URL}/core/salary/refresh/employee`).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    );
  }


  addEmployees(data: any): Observable<{ employeeStatus: string } | null> {
    return this._http.post<BackendResponse<{
      employeeStatus: string
    }>>(`${this.API_URL}/core/salary/add/employee`, data).pipe(
      map(this._sessionService.handleResponse<{ employeeStatus: string }>),
      catchError(this._sessionService.handleError)
    );
  }
  createRoster(data: any) {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/salary-card/v1/salary/all/card/transaction/prepare`, data).pipe(
      map(this._sessionService.handleResponse),
      catchError(this._sessionService.handleError)
    );
  }

  uploadSalaryExcelFile(body: any): Observable<any> {
    const formData = new FormData();

    let query = '?';

    formData.append('file', body.file, body.file.name);

    for (const key in body) {
      if (body.hasOwnProperty(key) && key !== 'file') {
        query += `${key}=${body[key]}&`;
      }
    }

    query = query.slice(0, -1);

    return this._http.post(`${this.API_URL}/core/salary/upload/salary-file${query}`, formData).pipe(
      catchError(this._sessionService.handleError)
    )
  }
}
