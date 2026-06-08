import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { BaseService } from 'src/app/shared/services/base.service';
import { environment } from 'src/environments/environment';
import { CurrencyAndAccountResponseTypes } from 'src/app/core/models/currencies-account-reponse-types.model';





@Injectable({
    providedIn: 'root'
})

export class SharedService extends BaseService {
    private baseUrl = `${environment.API_BASE}`;
    
    getGlobalCurrency(): Observable<CurrencyAndAccountResponseTypes | null> {
        return this.get<CurrencyAndAccountResponseTypes>(`${this.baseUrl}/api/account/v1/get/select-options`)
    }
}

