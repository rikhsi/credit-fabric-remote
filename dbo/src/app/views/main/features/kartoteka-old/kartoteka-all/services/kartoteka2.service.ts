import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

// Base service
import { BaseService } from '../../../../../../shared/services/base.service';


// Environment
import { environment } from "../../../../../../../environments/environment";

// Model
import { FileRequest, Kartoteka2ContentResponse, Kartoteka2Request } from '../models/kartoteka2.model';
import { StatusListResponseData } from '../../components/filter-kartoteka-2/kartoteka-2.interface';



@Injectable({
    providedIn: 'root'
})

export class Kartoteka2Service extends BaseService {
    private baseUrl = `${environment.API_BASE}`;

    getKartoteka2List(payload?: Kartoteka2Request): Observable<Kartoteka2ContentResponse | null> {
        return this.post<Kartoteka2ContentResponse>(`${this.baseUrl}/api/kartoteka/v1/card-file/get`, payload)
    }

    getRecipientList(params?: { coName?: string }): Observable<{coNameList : string[]} | null> {
        return this.get<{coNameList : string[]}>(`${this.baseUrl}/api/kartoteka/v1/card-file/get/recipient/list`, params)
    }

    getStatusList(): Observable<StatusListResponseData | null> {
        return this.get<StatusListResponseData>(`${this.baseUrl}/api/kartoteka/v1/card-file/get/status/list`)
    }

     getFiles(payload:FileRequest ): Observable<any| null> {
        return this.post<any>(`${this.baseUrl}/api/kartoteka/v1/receipt/generate/file`,payload )
    }

     getFileById(payload:{documentId: number , fileType:  "EXCEL" | "PDF"} ): Observable< any| null> {
         return this.post<any>(`${this.baseUrl}/api/kartoteka/v1/receipt/generate/file/one`,payload )
    }

}

