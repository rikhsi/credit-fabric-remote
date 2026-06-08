import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GetPaymentImportFileDataReq, GetPaymentImportFileDataRes, GetPaymentImportFileErrorRes, PaymentGetImportsAllReq, PaymentGetImportsAllRes,  UploadState } from '../models/mass-payments.model';
import { BehaviorSubject, catchError, map, Observable, Subject } from 'rxjs';
import { BackendResponse } from 'src/app/core/models/backend-response.model';
import { SessionService } from 'src/app/core/services/session.service';


@Injectable({
  providedIn: 'root'
})
export class MassPaymentsService {
  private API_URL = `${environment.API_BASE}`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService,
  ) {}

// #region UPLOAD EXCEL STATES
    private _uploadExcel$ = new BehaviorSubject<UploadState>({
      isUploading: false,
      fileName: '',
      progress: 0
    });

    readonly uploadExcel$ = this._uploadExcel$.asObservable();
// #endregion UPLOAD EXCEL STATES
// #region MASS-PAYMENT-TABLE STATES
  private _refreshMassPaymentTable$ = new Subject<void>()
  readonly refreshMassPaymentTable$ = this._refreshMassPaymentTable$.asObservable();

// #endregion MASS-PAYMENT-TABLE STATES

// #region MASS-PAYMENT-TABLE METHODS
  refreshMassPaymentTable() {
    this._refreshMassPaymentTable$.next()
  }

// #endregion MASS-PAYMENT-TABLE METHODS


// #region UPLOAD EXCEL METHODS
    setUploadExcel(isUploading:boolean,fileName:string,progress:number) {
      this._uploadExcel$.next({isUploading, fileName, progress})
    }


    completeUpload(success: boolean = true) {
      this._uploadExcel$.next({
        isUploading: false,
        fileName: '',
        progress: 0
      });
}
// #endregion UPLOAD EXCEL METHODS


  /**
   * GETTING UPLOADED FILES DATA 
   * @param body 
   * 
   * @returns PaymentGetImportsAllRes
   */
  getPaymentImportFileAll(body:PaymentGetImportsAllReq):Observable<PaymentGetImportsAllRes | null>{
    return this._http.post<BackendResponse<PaymentGetImportsAllRes>>(`${this.API_URL}/api/core-transaction/v1/payment/get/import/files/all`,body).pipe(
       map(this._sessionService.handleResponse<PaymentGetImportsAllRes>),
      catchError(this._sessionService.handleError)
    )
  }

  /**
   *  UPLOADING FILE  
   * @param file 
   * 
   *
   * @returns  Observable<{ id: string } | null>
   */
  paymentPrepareFile(file: File){
      const formData = new FormData();
      formData.append('file', file);

      return this._http.post(
        `${this.API_URL}/api/core-transaction/v1/payment/prepare-file`,
        formData,
        {
          reportProgress: true,
          observe: 'events',
          // responseType: 'blob',
        }
      )
    }


    /**
     * For download file
     * @param id 
     * 
     * @returns Observable<GetPaymentImportFileErrorRes | null>
     * 
     */
  getPaymentImportFileError(id:string)  {
    const params = new HttpParams()
    .set('id', id)
    return this._http.get(`${this.API_URL}/api/core-transaction/v1/payment/get/import/file/error`,{params})
  }

  /**
   * FOR GETTING ALL AND ERRORS
   * @param id 
   * 
   * @param isError 
   * @returns Observable<GetPaymentImportFileDataRes | null> 
   * 
   */

  getPaymentImportFileData(body:GetPaymentImportFileDataReq):Observable<GetPaymentImportFileDataRes | null> {
    return this._http.post<BackendResponse<GetPaymentImportFileDataRes>>(`${this.API_URL}/api/core-transaction/v1/payment/get/import/file/data`,body).pipe(
       map(this._sessionService.handleResponse<GetPaymentImportFileDataRes>),
      catchError(this._sessionService.handleError)
    )
  }  

  downloadMassivePaymentExcelFile(fileName: string) {
      const params = new HttpParams().set('fileName', fileName);
      
      return this._http.get(
        `${this.API_URL}/api/core-transaction/v1/payment/get/download/massive-payment-excel-file`,
        {
          params,
          responseType: 'blob',
          observe: 'events',
          reportProgress: true 
        }
  );
}

  getMassivePaymentFileStatistics(fileId:string) {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/payment/get/import/file/statistics`,{fileId}).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    )
  }

  getFileTransactionStatuses():Observable<any> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/payment/get/file-transaction/status/list`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    )
  }


  downloadPaymentFile(body:any) :Observable<any>{
    return this._http.post(`${this.API_URL}/api/core-transaction/v1/payment/file/data/download/excel`,body,{
       responseType: 'blob',
      observe: 'events',
      reportProgress: true 
    })
  }

  getFileTransactionDetail(id:string):Observable<any> {
    const params = new HttpParams().set('id', id);
    return this._http.get<any>(`${this.API_URL}/api/core-transaction/v1/payment/get/file-transaction-row/detail`,{params}).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    )
  }

  // /api/core-transaction/v1/payment/get/file-transaction-row/detail
}
