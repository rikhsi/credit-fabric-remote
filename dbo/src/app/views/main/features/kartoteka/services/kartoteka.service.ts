import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { BaseService } from '../../../../../shared/services/base.service';

import { environment } from "../../../../../../environments/environment";

import { StatusListResponseData,  FileRequest, KartotekaContentResponse, KartotekaOne, KartotekaRequest, TemporaryQrPayload, IMoveToKartoteka2Response, EPTListResponse, EPTFilterRequest, KartotekaContent, KartotekaTransactions, IClientReservation, ClientReservationNeeds, KartotekaTransactionsResponse } from '../models/kartoteka.model';


@Injectable({
    providedIn: 'root'
})



export class KartotekaService extends BaseService {
    private baseUrl = `${environment.API_BASE}`;

    getKartotekaList(payload?: KartotekaRequest): Observable<KartotekaContentResponse <KartotekaContent>| null> {
        return this.post<KartotekaContentResponse<KartotekaContent>>(`${this.baseUrl}/api/kartoteka/v1/card-file/get`, payload)
    }

    getKartotekaById(documentId: number): Observable<KartotekaOne| null> {
        return this.post<KartotekaOne>(`${this.baseUrl}/api/kartoteka/v1/card-file/get/one`, {documentId})
    }

    getRecipientList(params?: { coName?: string | null , recipientType?: string | null }): Observable<{ coNameList: string[] } | null> {
        return this.get<{ coNameList: string[] }>(`${this.baseUrl}/api/kartoteka/v1/card-file/get/recipient/list`, params)
    }

    getFiles(payload: FileRequest): Observable<any | null> {
        return this.post<any>(`${this.baseUrl}/api/kartoteka/v1/receipt/generate/file`, payload)
    }

    getFileById(payload: { documentId: number, fileType: "EXCEL" | "PDF" }): Observable<any | null> {
        return this.post<any>(`${this.baseUrl}/api/kartoteka/v1/receipt/generate/file/one`, payload)
    }

    getCardFilesTransactions(documentId: number | null): Observable<KartotekaTransactionsResponse| null> {
        return this.post<KartotekaTransactionsResponse>(`${this.baseUrl}/api/kartoteka/v1/card-file/get/transactions`, {documentId})
    }


    getCardKartotekaTemporaryQr(payload:TemporaryQrPayload ): Observable<{qrLink :string,  expireTime:string} | null> {
        return this.post<{qrLink :string,  expireTime:string}>(`${this.baseUrl}/api/kartoteka/v1/card-file/generate/temporary/qr`, payload)
    }

    getCardKartotekaTemporaryQrChecker(temporaryId?: string ): Observable<{status: "EXPIRED" | "RECEIVED" | "CREATED" | "SUCCESS" | "FAILED"} | null> {
        return this.get<{status: "EXPIRED" | "RECEIVED" | "CREATED" | "SUCCESS" | "FAILED"}>(`${this.baseUrl}/api/kartoteka/v1/card-file/check/temporary/qr`, {temporaryId})
    }

    getReservesList(): Observable<KartotekaContentResponse<IClientReservation> | null> {
        return this.get<KartotekaContentResponse<IClientReservation>>(`${this.baseUrl}/api/kartoteka/v1/card-file/get/customer/reserves`)
    }

    getNeedsList(): Observable<KartotekaContentResponse<ClientReservationNeeds> | null> {
        return this.get<KartotekaContentResponse<ClientReservationNeeds>>(`${this.baseUrl}/api/kartoteka/v1/card-file/get/customer/needs`)
    }

    moveToKartoteka2(payload: {cms: string}): Observable<IMoveToKartoteka2Response | null> {
        return this.post<IMoveToKartoteka2Response>(`${this.baseUrl}/api/kartoteka/v1/card-file/move-to-kartoteka2`, payload)
    }


    getStatusList(): Observable<StatusListResponseData | null> {
        return this.get<StatusListResponseData>(`${this.baseUrl}/api/kartoteka/v1/card-file/get/status/list`)
    }

     getEPTList(payload?: EPTFilterRequest): Observable<EPTListResponse | null> {
        return this.post<EPTListResponse>(`${this.baseUrl}/api/kartoteka/v1/card-file/get/docs`, payload)
    }

}

