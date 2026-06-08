import {Injectable} from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SessionService } from './session.service';
import { IStatementsDto } from '../../views/main/features/accounts-payments/models/statements.interface';
import { catchError, map, Observable } from 'rxjs';
import { BackendResponse } from '../models/backend-response.model';
import {AccountInfoDto, accountOrderEnum, AccountPinListDto, AccountsDto, AccountsList} from '../../views/main/features/accounts-payments/models/accounts-payments.model';
import * as XLSX from 'xlsx';
import { getStatusApplication } from '../utils/mixin.utils';
import { TotalBalanceResponse } from "../../views/main/features/main/interfaces/balance-accounts.interface";
import { OperDayDto } from "../../views/main/right-bar/models/right-bar.model";
import { removeNullOrEmptyFieldsFromObject } from '../utils';
import { DailyTransactionResDto } from 'src/app/shared/models/account/transaction.model';
import { CurrencyAndAccountResponseTypes } from '../models/currencies-account-reponse-types.model';
import {NewSessionService} from "../../views/main/features/new-settings/services/new-session.service";

@Injectable({
  providedIn: 'root'
})

export class AccountService {
  private API_URL = `${environment.API_BASE}`;

  constructor(
    private _http: HttpClient,
    private _sessionService: SessionService,
    private _newSessionService: NewSessionService,
) {
  }

  getAccountList(pageable: { size: number, page: number }, filter: any): Observable<AccountsList | null> {
    return this._http.post<BackendResponse<AccountsList>>(`${this.API_URL}/api/account/v1/get/all`,
      removeNullOrEmptyFieldsFromObject({
        ...pageable,
        ...filter,
        accountOrderEnums: {
          [accountOrderEnum.ACCOUNT_NUMBER]: 0,
        }
      }, true, ['size', 'page'])
      , { headers: { 'X-Device-Type': 'WEB' } }).pipe(
        map(this._sessionService.handleResponse<AccountsList>),
        catchError(this._sessionService.handleError)
      );
  }

  orderAccountList(body): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/account/v1/pin/change/order`, body, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  orderCardList(body): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/salary-card/v1/card/all/pin/change/order`, body, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  orderDepositList(body): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/deposit-credit/v1/deposit/pin/change/order`, body, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  orderCreditList(body): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/deposit-credit/v1/credit/pin/change/order`, body, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getAllResponseType(): Observable<{ key: string, value: string }[] | null> {
    return this._http.get<BackendResponse<{ key: string, value: string }[]>>(`${this.API_URL}/api/account/v1/get/all/account-response-type`).pipe(
      map(this._sessionService.handleResponse<{ key: string, value: string }[]>),
      catchError(this._sessionService.handleError)
    );
  }

  getAccountListV2(pageable: { size: number, page: number }, filter: any): Observable<AccountsList | null> {
    return this._http.post<BackendResponse<AccountsList>>(`${this.API_URL}/api/account/v1/get-accounts-2`,

      {
        paging: {
          ...pageable
        },
        filter: {
          ...filter,
        },
        // accountOrderEnums: {
        //   [accountOrderEnum.ACCOUNT_NUMBER]: 0,
        // }

      }, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
        map(this._sessionService.handleResponse<AccountsList>),
        catchError(this._sessionService.handleError)
      );
  }
  getPinnedAccounts(): Observable<AccountPinListDto | null> {
    return this._http.get<BackendResponse<AccountPinListDto>>(`${this.API_URL}/api/account/v1/pin/list`,
      { headers: { 'X-Device-Type': 'WEB' } }).pipe(
        map(this._sessionService.handleResponse<AccountPinListDto>),
        catchError(this._sessionService.handleError)
      );
  }

  getOperDayNew(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/reference/request/get-oper-day`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  getSalaryPurposeType(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/dictionary/salary-purpose-code`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getPurposesPayment(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/physical/card/purpose/types`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  getPurposesCorpCard(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/dictionary/corp-card-purpose-code`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  getCardInfo(data: { pan: string }): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/physical/card/info`, data).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getCardPurposes(data: { pan: string, purposeType: string }): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/account-transaction/v1/physical/card/get/payment/purpose`, data).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getOperDayTimeNew(): Observable<OperDayDto | null> {
    return this._http.get<BackendResponse<OperDayDto>>(`${this.API_URL}/api/core-transaction/v1/reference/request/get-end-file-time`).pipe(
      map(this._sessionService.handleResponse<OperDayDto>),
      catchError(this._sessionService.handleError)
    );
  }

  getAccountBalance(data: { currency: string, module?: string, accountFilter?: any }): Observable<TotalBalanceResponse | null> {
    return this._http.post<BackendResponse<TotalBalanceResponse>>(`${this.API_URL}/api/account/v1/get-total-balance`, data).pipe(
      map(this._sessionService.handleResponse<TotalBalanceResponse>),
      catchError(this._sessionService.handleError)
    );
  }

  getAccountHistoryV2(data: {
    paging: { page: number, size: number },
    id: string,
    date: { dateBegin: string, dateClose: string }
  }): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/account/v1/get-account-history-by-id`, data).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getPaymentAllowed(
    pageable: { size: number, page: number },
    data: { senderAccount: string | null, transactionMode: string | null, accountType?: string, search?: string }
  ): Observable<AccountsList | null> {
    return this._http.post<BackendResponse<AccountsList | null>>(`${this.API_URL}/api/account-transaction/v1/check-payment/get-payment-allowed`, {
      ...pageable,
      ...data
    }).pipe(
      map(this._sessionService.handleResponse<AccountsList | null>),
      catchError(this._sessionService.handleError)
    );
  }
  getPaymentAllowedLoan(accountNumber:string | undefined): Observable<AccountsDto | null> {
    return this._http.post<BackendResponse<AccountsDto | null>>(`${this.API_URL}/api/account-transaction/v1/check-payment/get-payment-allowed-loan`, {
      accountNumber
    }).pipe(
      map(this._sessionService.handleResponse<AccountsDto | null>),
      catchError(this._sessionService.handleError)
    );
  }

  getAccountListForTable(pageable: { size: number, page: number }, filter: any): Observable<AccountsList | null> {
    return this._http.post<BackendResponse<AccountsList>>(`${this.API_URL}/core/account/get/all`,
      {
        ...pageable,
        ...filter,
        accountOrderEnums: {
          [accountOrderEnum.ACCOUNT_NUMBER]: 0,
        }
      }
    ).pipe(
      map(this._sessionService.handleResponse<AccountsList>)
    );
  }


  getAccountHistory(data: IStatementsDto): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/core/account/get/history`, data).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getAccountInfo(accountNumber: string | undefined): Observable<AccountInfoDto | null> {
    return this._http.get<BackendResponse<AccountInfoDto>>(`${this.API_URL}/api/account/v1/get/info?accountNumber=${accountNumber}`).pipe(
      map(this._sessionService.handleResponse<AccountInfoDto>),
      catchError(this._sessionService.handleError)
    );
  }

  getDailyTransaction(accountNumber: string): Observable<DailyTransactionResDto | null> {
    return this._http.post<BackendResponse<DailyTransactionResDto>>(`${this.API_URL}/api/account/v1/get/daily-transaction`, { accountNumber }).pipe(
      map(this._sessionService.handleResponse<DailyTransactionResDto>),
      catchError(this._sessionService.handleError)
    );
  }

  getCurrencyAndAccountResponseTypes(): Observable<CurrencyAndAccountResponseTypes | null> {
    return this._http.get<BackendResponse<CurrencyAndAccountResponseTypes>>(`${this.API_URL}/api/account/v1/get/select-options`).pipe(
      map(this._sessionService.handleResponse<CurrencyAndAccountResponseTypes>),
      catchError(this._sessionService.handleError)
    );
  }

  getAccountQr(data: { accountId: string }): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{ msg: string }>>(`${this.API_URL}/api/account/v1/get/qr`, data).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    );
  }
  getAccountInfoV2(data: { account: string, codeFilial: string, id: string }): Observable<AccountInfoDto | null> {
    return this._http.post<BackendResponse<AccountInfoDto>>(`${this.API_URL}/api/account/v1/get-account-details`, data).pipe(
      map(this._sessionService.handleResponse<AccountInfoDto>),
      catchError(this._sessionService.handleError)
    );
  }
  unpinAccount(accountId: number, accountNumber: string | undefined): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{ msg: string }>>(`${this.API_URL}/api/account/v1/unpin`, { accountId, accountNumber }, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    );
  }
  createPin(accountId: number, accountNumber: string | undefined, codeFilial: string | undefined): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{ msg: string }>>(`${this.API_URL}/api/account/v1/create/pin`, { accountId, accountNumber, codeFilial }, { headers: { 'X-Device-Type': 'WEB' } }).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    );
  }

  getAccountHistoryExcel(data: IStatementsDto): Observable<any> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/core/account/get/history/excel`, data).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  exportAccountDetailToExcel(data: AccountInfoDto) {
    const formatted = [
      ['Наименование клиента', data.holderInfo],
      ['ИНН', data.inn],
      ['Номер счета', data.altAcctId],
      ['Наименование счета', data.accountTitle],
      ['Валюта', data.balance.currency],
      ['МФО', data.mfo],
      ['Наименование банка', 'АКБ "Hamkor BANK"'],
      ['SWIFT', 'ASACUZ22XXX'],
      ['Дата открытия счета', data.openDate]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(formatted);

    const columnNames = Object.keys(formatted[0]);

    const columnWidths = columnNames.map(name => {
      const maxLength = Math.max(
        name.length,
        ...formatted.map(obj => String((obj as any)[name] || '').length)
      );

      return { width: maxLength + 2 };
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Accounts');
    const fileName = `account-info-${new Date().getTime()}.xlsx`

    XLSX.writeFile(workbook, fileName);
  }

  exportToExcel(data: AccountsDto[]) {
    const formattedData = data.map(item => ({
      'Счёт': item.altAcctId,
      'Название': item.accountTitle,
      'Валюта': item.balance.currency,
      'Остаток': item.balance.amount / 100,
      'Статус': getStatusApplication(item.status).label,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const columnNames = Object.keys(formattedData[0]);

    const columnWidths = columnNames.map(name => {
      const maxLength = Math.max(
        name.length,
        ...formattedData.map(obj => String((obj as any)[name] || '').length)
      );

      return { width: maxLength + 2 };
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Accounts');

    XLSX.writeFile(workbook, 'accounts.xlsx');

  }

  updateAccountDailyTransaction(account: string, accountId: string): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{
      msg: string
    }>>(`${this.API_URL}/core/account/add/daily-transaction?account=${account}&accountId=${accountId}`, {}).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    )
  }
  getAccountHistoryById(paging: { page: number, size: number },
    filter: { id?: number, date: { dateBegin: string, dateClose: string } }): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(
      `${this.API_URL}/api/account/v1/get-account-history-by-id`, {
      ...filter,
      paging,
    })
      .pipe(
        map(this._sessionService.handleResponse<any>)
      );
  }

  generateSalaryCardsFile(
    data: { page: number, size: number, userType: string, contractNumber: string, transitAccount: string }
  ): Observable<{ msg: string } | null> {
    return this._http.post<BackendResponse<{ msg: string }>>(`${this.API_URL}/api/salary-card/v1/card/all/generate/file`, data).pipe(
      map(this._sessionService.handleResponse),
      catchError(this._sessionService.handleError)
    );
  }

  uploadTransactionFile(formData: FormData, salaryPrepareReq: any): Observable<any | null> {
    const params = new HttpParams({ fromObject: salaryPrepareReq });
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/salary-card/v1/salary/all/parse/file/upload`, formData, { params }).pipe(
      map(this._sessionService.handleResponse),
      catchError(this._sessionService.handleError)
    );
  }

  userNotificationList(data): Observable<any | null> {
    return this._http.post<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/all`, data).pipe(
      map(this._sessionService.handleResponse<{ msg: string }>),
      catchError(this._sessionService.handleError)
    )
  }
  getNotificationUnReadCount(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/unread-count`).pipe(
      map(this._newSessionService.handleResponse<{ msg: string }>),
      catchError(this._newSessionService.handleError)
    )
  }
  setNotificationUnReadAll(data = null): Observable<any | null> {
    return this._http.put<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/read-all`, data).pipe(
      map(this._newSessionService.handleResponse<{ msg: string }>),
      catchError(this._newSessionService.handleError)
    )
  }
  setReadNotification(data ): Observable<any | null> {
    return this._http.put<BackendResponse<any>>(`${this.API_URL}/api/user/v1/notification/read`, data).pipe(
      map(this._newSessionService.handleResponse<{ msg: string }>),
      catchError(this._newSessionService.handleError)
    )
  }
  getManualCurrencySelectList(): Observable<any | null> {
    return this._http.get<BackendResponse<any>>(`${this.API_URL}/api/account/v1/manual/currency/select-list`).pipe(
      map(this._newSessionService.handleResponse<{ msg: string }>),
      catchError(this._newSessionService.handleError)
    )
  }
}
