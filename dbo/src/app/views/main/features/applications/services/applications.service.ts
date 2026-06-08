import {inject, Injectable} from '@angular/core';
import {environment} from "../../../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import {catchError, map, Observable, of, Subject} from 'rxjs';
import {PagableResponse} from "../../loans/models/loan.model";
import {SessionService} from "../../../../../core/services/session.service";
import {AccountV2DTO, AppReportParentDTO, AppReportTMPDTO2, IApplicationFilter} from "../../../../../shared/interfaces/applications.interface";
import {CreateReportReqDto} from "../../accounts-payments/components/statements-history-v2/components/create-statement/create-statement.model";
import {BackendResponse} from "../../../../../core/models/backend-response.model";
import {BudgetAccountReferenceDto} from "../../accounts-payments/models/accounts-payments.model";
import {StatmentApplicationResContent} from "../../accounts-payments/components/statements-history-v2/models/statement-history.model";
import {ReportTypes} from "../../../../../constants/ReportTypes";

@Injectable({
  providedIn: 'root'
})
export class ApplicationsService {
  private API_URL = `${environment.API_BASE}`;
  private _http = inject(HttpClient)
  private _sessionService = inject(SessionService);
  public $applicationState = new Subject();

  getApplications(body: IApplicationFilter): Observable<PagableResponse<any> | null> {
    return this._http.post<any>(`${this.API_URL}/api/account/v1/application/get/all`, body)
      .pipe(
      map(this._sessionService.handleResponse<any>)
    )
  }

  deleteApplications(ids: string[]): Observable<any> {
    const query = ids.map(id => `id=${id}`).join('&');
    const url = `${this.API_URL}/api/account/v1/application/delete/all?${query}`;
    return this._http.delete<any>(url)
      .pipe(
        map(this._sessionService.handleResponse<any>)
      )
  }
  deleteReportV2(ids: string[]): Observable<any> {
    const query = ids.map(id => `report_id_list=${id}`).join('&');
    const url = `${this.API_URL}/api/reports/v1?${query}`;
    return this._http.delete<any>(url)
      .pipe(
        map(this._sessionService.handleResponse<any>)
      )
  }
  deleteReportRegularV2(periodic_report_id: string): Observable<any> {
    const url = `${this.API_URL}/api/reports/v1/periodic/${periodic_report_id}`;
    return this._http.delete<any>(url)
      .pipe(
        map(this._sessionService.handleResponse<any>)
      )
  }

  getApplReportParent(): Observable<AppReportParentDTO[]> {
    return this._http.get<any>(`${this.API_URL}/api/account/v1/application/report/parent`).pipe(
      map(this._sessionService.handleResponse<any>),
      map((res: any) => res?.data ?? []),
      catchError(() => of([]))
    );
  }

  getReportForm(template_id: string): Observable<AppReportTMPDTO2 | null> {
    return this._http.get<any>(`${this.API_URL}/api/reports/v1/templates/${template_id}`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(() => of(null))
    );
  }

  postReportFItems(template_id: string, parameter_id: string): Observable<AccountV2DTO[]> {
    return this._http.post<any>(`${this.API_URL}/api/reports/v1/parameter-items/${template_id}/${parameter_id}`, {}).pipe(
      map(this._sessionService.handleResponse<any>),
      map((res: any) => res?.items ?? []),
      catchError(() => of([]))
    );
  }

  postReportGenerate(template_id: string, format: string, params: any): Observable<any> {
    return this._http.post<any>(`${this.API_URL}/api/reports/v1/generate/${template_id}?format=${format}`, params).pipe(
      map(this._sessionService.handleResponse<any>)
    );
  }

  postReportGenerate2(template_id: string, format: string, params: any): Observable<any> {
    return this._http.post<any>(`${this.API_URL}/api/account/v1/application/create/v2/report/${template_id}?format=${format}`, params).pipe(
      map(this._sessionService.handleResponse<any>)
    );
  }

  postReportPeriodic(template_id: string, format: string, frequency: string, params: any): Observable<any> {
    return this._http.post<any>(`${this.API_URL}/api/reports/v1/periodic/${template_id}?format=${format}&frequency=${frequency}&name=TestWeb&timezone=Asia/Tashkent`, params).pipe(
      map(this._sessionService.handleResponse<any>)
    );
  }

  putReportPeriodic(periodic_report_id: string, format: string, frequency: string, params: any): Observable<any> {
    return this._http.put<any>(`${this.API_URL}/api/reports/v1/periodic/${periodic_report_id}?format=${format}&frequency=${frequency}&timezone=Asia/Tashkent`, params).pipe(
      map(this._sessionService.handleResponse<any>)
    );
  }

  getApplReportStatus(page: number, size: number): Observable<{list: any[], total: number}> {
    return this._http.get<any>(`${this.API_URL}/api/reports/v1/status?page=${page}&size=${size}`).pipe(
      map(this._sessionService.handleResponse<any>),
      map((res: any) => {
        if (res && res.reports && res.reports.length > 0) {
          return {list: res.reports, total: res.total_elements};
        }
        return {list: [], total: 0};
      }),
      catchError(() => of({list: [], total: 0}))
    );
  }

  getApplReportPeriodic(page: number, size: number): Observable<{list: any[], total: number}> {
    return this._http.get<any>(`${this.API_URL}/api/reports/v1/periodic?page=${page}&size=${size}`).pipe(
      map(this._sessionService.handleResponse<any>),
      map((res: any) => {
        if (res && res.reports && res.reports.length > 0) {
          return {list: res.reports, total: res.total_elements};
        }
        return {list: [], total: 0};
      }),
      catchError(() => of({list: [], total: 0}))
    );
  }

  getApplReportParentV2(): Observable<AppReportParentDTO[]> {
    return this._http.get<any>(`${this.API_URL}/api/reports/v1/templates`).pipe(
      map(this._sessionService.handleResponse<any>),
      map((res: any) => {
        let repTypes: AppReportParentDTO[] = ReportTypes;
        const getTypes: {template_id: string; template_name: string;}[] = res && res.templates && res.templates.length > 0 ? res.templates : [];
        for (const template of repTypes) {
          // const parentFnd = getTypes.find((val) => val.template_id === template.value);
          // if (parentFnd) {
          //   template.description = parentFnd.template_name;
          // }

          const chChilds: AppReportParentDTO[] = [];
          for (const tChild of template.child) {
            const childFnd = getTypes.find((val) => val.template_id === tChild.value);
            if (childFnd) {
              chChilds.push({...tChild, description: childFnd.template_name});
              // tChild.description = childFnd.template_name;
            }
          }
          template.child = chChilds;
        }
        // console.log(getTypes);
        // console.log(repTypes.filter((vl) => vl.child.length > 0));
        return repTypes.filter((vl) => vl.child.length > 0);
      }),
      catchError(() => of([]))
    );
  }

  downloadReportAPI(id: string): Observable<Blob | null> {
    return this._http.get(`${this.API_URL}/api/reports/v1/download/${id}`, {responseType: 'blob'}).pipe(
      catchError((err) => {
        console.error('Download error', err);
        return of(null);
      })
    );
  }

  getApplReportOne(id: number | string): Observable<StatmentApplicationResContent | null> {
    return this._http.get<any>(`${this.API_URL}/api/account/v1/application/get/one?applicationId=${id}`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(() => of(null))
    );
  }

  createNewReport(body: CreateReportReqDto): Observable<{ message: string } | null> {
    return this._http.post<BackendResponse<{ message: string }>>(`${this.API_URL}/api/account/v1/application/create/report`, body).pipe(
      map(this._sessionService.handleResponse<{ message: string }>),
      catchError(this._sessionService.handleError)
    )
  }

  updateNewReport(id: number, body: CreateReportReqDto): Observable<{ message: string } | null> {
    return this._http.put<BackendResponse<{ message: string }>>(`${this.API_URL}/api/account/v1/application/update/report?id=${id}`, body).pipe(
      map(this._sessionService.handleResponse<{ message: string }>),
      catchError(this._sessionService.handleError)
    )
  }

  getAccountReferenceList(data: { account?: string | null, search?: string | null, inn?: string | null, page: number, size: number }): Observable<BudgetAccountReferenceDto | null> {
    return this._http.post<BackendResponse<BudgetAccountReferenceDto>>(`${this.API_URL}/api/account/v1/reference`, data).pipe(
      map(this._sessionService.handleResponse<BudgetAccountReferenceDto>),
      catchError(this._sessionService.handleError)
    );
  }
}
