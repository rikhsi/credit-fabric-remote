import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, Subject, take} from 'rxjs';
import * as XLSX from 'xlsx';
import {BackendResponse} from '../models/backend-response.model';
import {SessionService} from './session.service';
import pdfMake from 'pdfmake/build/pdfmake';

// @ts-ignore
import {vfs} from 'pdfmake/build/vfs_fonts';
import {AccountInfoDto} from '../../views/main/features/accounts-payments/models/accounts-payments.model';
import {TransactionOneDetailDto} from "../models/transaction.models";
import {
  PayrollProjectResponseGroupContent
} from "../../views/main/features/payroll-project/models/payroll-project.type";

pdfMake.vfs = vfs;

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private API_URL = `${environment.API_BASE}`;

  transactionsHistoryRange = new Subject<{ startDate: string, endDate: string }>();

  constructor(
    private http: HttpClient,
    private _sessionService: SessionService,
  ) {
  }

  getTransactionsCounts(from: string, to: string) {
    return this.http.get(`${this.API_URL}/core/payment/get/transaction-count?from=${from}&to=${to}`)
  }

  getTransactionsActionHistory(id: string): Observable<any> {
    return this.http.get<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/payment/get/transaction/action/history?id=${id}`,).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getTransactionHistory(data: { paging: {
      page: number,
      size: number,
    }, params: {
      isSigned: boolean | null
    }}) {
    return this.http.post(`${this.API_URL}/api/core-transaction/v1/documents/get/unsigned/page`, data)
  }

  checkKartoteka(transactionMode: string) {
    return this.http.get<BackendResponse<any>>(`${this.API_URL}/api/kartoteka/v1/card-file/get/payment/reserve-and-need?transactionMode=${transactionMode}`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getTransactionSavedDetail(id: string): Observable<any> {
    return this.http.get<BackendResponse<any>>(`${this.API_URL}/core/saved-payment/get/transaction-one?id=${id}`,).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getExcelForTransaction(id: string): Observable<any> {
    return this.http.get<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/receipt/generate/excel?id=${id}`,).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }


  getQrForPayment(id: string): Observable<any> {
    return this.http.get<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/payment/get/transaction/temporary/qr?id=${id}`,).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getQrForMassPayment(body: any): Observable<any> {
    return this.http.post<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/payment/get/file/transaction/temporary/qr`, body).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getQrForAuth(data: {id: string  }): Observable<any> {
    return this.http.post<BackendResponse<any>>(`${this.API_URL}/api/identity/v1/auth/sign/login-check-mobile-qr`, data).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  deleteTransaction(id: string | string[]): Observable<any> {
    return this.http.post<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/payment/delete/transaction-list`, {ids: typeof id === 'string' ? [id] : [...id]}).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  deletePreErrorTransaction(id: string): Observable<any> {
    return this.http.get<BackendResponse<any>>(`${this.API_URL}/api/core-transaction/v1/payment/delete/file-transaction-row/${id}`).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }

  getTransactionDetail(id: string): Observable<TransactionOneDetailDto | null> {
    return this.http.post<BackendResponse<TransactionOneDetailDto>>(`${this.API_URL}/api/account-transaction/v1/payment/request/get-signed-uzs-transaction-one`, {id}).pipe(
      map(this._sessionService.handleResponse<TransactionOneDetailDto>),
      catchError(this._sessionService.handleError)
    );
  }
  generatePDF(id: string): Observable<any | null> {
    return this.http.get<BackendResponse<any>>(
      `${this.API_URL}/api/core-transaction/v1/receipt/generate/pdf`,
      { params: { id } }
    ).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }


  corpCardTransactionHistoryPDF(id: string): Observable<any | null> {
    return this.http.get<BackendResponse<any>>(
      `${this.API_URL}/api/salary-card/v1/receipt/generate/pdf`,
      { params: { id } }
    ).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }


  getBudgetDetail(id: string | any): Observable<TransactionOneDetailDto | null> {
    return this.http.post<BackendResponse<TransactionOneDetailDto>>(`${this.API_URL}/api/account-transaction/v1/budget/request/get-signed-budget-transaction-one`, {id}).pipe(
      map(this._sessionService.handleResponse<TransactionOneDetailDto>),
      catchError(this._sessionService.handleError)
    );
  }

  exportStatementToExcel(data: {
    account: AccountInfoDto,
    transactions: any[],
    balanceBefore: any,
    balanceAfter: any,
    lastTransactionTime: string,
  }) {
    const formattedData = data.transactions?.map((item) => ({
      'Счет корреспондента': item.ctAcc,
      'МФО': item.ctMfo,
      'Сумма дебет': `${item.debit.amount / 100} ${item.debit.currency}`,
      'сумма кредит': `${item.credit.amount / 100} ${item.credit.currency}`,
      'Дата': item.date,
      '№ документа': item.numberTrans,
      'Наименование банка корреспондента': item.ctBankName,
      'Наименование корреспондента': item.ctAccName,
      'МФО/БХМ корреспондета': item.ctMfo,
      'КОД': item.code,
      'Назначение платежа': item.purpose,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const columnNames = Object.keys(formattedData[0]);

    const columnWidths = columnNames.map(name => {
      const maxLength = Math.max(
        name.length,
        ...formattedData.map(obj => String((obj as any)[name] || '').length)
      );

      return {width: maxLength + 2};
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    XLSX.writeFile(workbook, 'transactions.xlsx');

  }

  exportToExcel(data: any[]) {
    const formattedData = data.map(item => ({
      'Номер документа': item.docNum,
      'Сумма получателя': item.receiverAmount.amount / 100,
      'Сумма отправителя': item.senderAmount.amount / 100,
      'Имя отправителя': item.sender.name,
      'ИНН отправителя': item.sender.tax,
      'Код филиала отправителя': item.sender.codeFilial,
      'Счет отправителя': item.sender.account,
      'Назначение': item.purpose.name,
      'Код назначения': item.purpose.code,
      'Имя получателя': item.recipient.name,
      'Счет получателя': item.recipient.account,
      'ИНН получателя': item.recipient.tax,
      'Код филиала получателя': item.recipient.codeFilial,
      'ExternalID': item.externalId,
      'Тип транзакции': item.type,
      'Режим транзакции': item.transactionMode,
      'Дата документа': item.docDate,
      'Статус АБС': item.absStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const columnNames = Object.keys(formattedData[0]);

    const columnWidths = columnNames.map(name => {
      const maxLength = Math.max(
        name.length,
        ...formattedData.map(obj => String((obj as any)[name] || '').length)
      );

      return {width: maxLength + 2};
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    XLSX.writeFile(workbook, 'transactions.xlsx');

  }

  exportKartoteka2DetailsToExcel(data: any[], name = 'kartoteka2') {
    const formattedData = data.map(item => ({
      'ID': item.documentId,
      'Опер день': item.operDate,
      'Дата выполнения': item.executeTime,
      'Тип операции': item.leadType,
      'Сумма оплаты': (item.sumPay / 100).toLocaleString('en-US', {minimumFractionDigits: 2}),
      'Остаток': (item.sumSaldo / 100).toLocaleString('en-US', {minimumFractionDigits: 2}),
      'Стосояние проводки': item.state
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const columnNames = Object.keys(formattedData[0]);

    const columnWidths = columnNames.map(name => {
      const maxLength = Math.max(
        name.length,
        ...formattedData.map(obj => String((obj as any)[name] || '').length)
      );

      return {width: maxLength + 2};
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, name);

    XLSX.writeFile(workbook, `${name}__details.xlsx`);
  }

  exportKartoteka2ToExcel(data: any[], name = 'Karoteka2') {
    const formattedData = data.map(item => ({
      'Код': item.documentId,
      'Номер документа': item.docNum,
      'Дата': item.dateEnter,
      'Сумма по документу': (item.sumDoc / 100).toLocaleString('en-US', {minimumFractionDigits: 2}),
      'Остаток': (item.sumSaldo / 100).toLocaleString('en-US', {minimumFractionDigits: 2}),
      'МФО получателя': item.coMfo,
      'ИНН': item.coInn,
      'Подразделение': item.codeFilial,
      'Счет получателя': item.coAcc,
      'Счет клиента': item.clAcc,
      'Код назначения платежа': item.purposeCode,
      'Состояние': item.state
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const columnNames = Object.keys(formattedData[0]);

    const columnWidths = columnNames.map(name => {
      const maxLength = Math.max(
        name.length,
        ...formattedData.map(obj => String((obj as any)[name] || '').length)
      );

      return {width: maxLength + 2};
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, name);

    XLSX.writeFile(workbook, `${name}.xlsx`);
  }

  exportEmployeesAgreementToExcel(data: PayrollProjectResponseGroupContent[], name = 'employee-agreements') {
    const formattedData = data.map(item => ({
      'Тип зарплатного проекта': item.type,
      'Количество карт': item.count,
      'Номер договора': item.contractNumber,
      'Счет договора': item.transitAccount
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const columnNames = Object.keys(formattedData[0]);

    const columnWidths = columnNames.map(name => {
      const maxLength = Math.max(
        name.length,
        ...formattedData.map(obj => String((obj as any)[name] || '').length)
      );

      return {width: maxLength + 2};
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, name);

    XLSX.writeFile(workbook, `${name}.xlsx`);
  }

  exportCorpCardToExcel(data: PayrollProjectResponseGroupContent[], name = 'corp-cards') {
    const formattedData = data.map(item => ({
      'Тип карты': item.type,
      'Количество карт': item.count,
      'Номер договора': item.contractNumber,
      'Счет договора': item.transitAccount,
      'Валюта': item.currency,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const columnNames = Object.keys(formattedData[0]);

    const columnWidths = columnNames.map(name => {
      const maxLength = Math.max(
        name.length,
        ...formattedData.map(obj => String((obj as any)[name] || '').length)
      );

      return {width: maxLength + 2};
    });

    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, name);

    XLSX.writeFile(workbook, `${name}.xlsx`);
  }
  public getCheckTransaction(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.API_URL}/api/core-transaction/v1/receipt/check?id=${id}`)
      .pipe(take(1));
  }
}
