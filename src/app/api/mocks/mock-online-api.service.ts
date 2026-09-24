import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { delay, Observable, of, throwError } from 'rxjs';
import { ClaimLoanPayload, ClaimLoanResult, ApplicationStatus, OnlineApplication, OnlineOffer } from '@api/models/los/application';
import { EligibilityResult, OnlineBranchesResult, OnlineGetInfoResult } from '@api/models/los/online';
import { OnlineCheckOtpResponse, OnlineCheckOtpResult, OnlineSendOtpResponse, OnlineSendOtpResult } from '@api/models/los/otp';
import { StartProcessingPayload, StartProcessingResult } from '@api/models/los/start-processing';
import { MOCK_APPLICATIONS_BY_ID, MOCK_APPLICATIONS_LIST, MOCK_OFFERS_BY_ID } from './applications.mock';
import { MOCK_ONLINE_BRANCHES } from './handbooks.mock';
import { MOCK_DELAY_MS, mockOf } from './mock-delay';

@Injectable()
export class MockOnlineApiService {
  public checkValidated$(): Observable<OnlineCheckOtpResult> {
    return mockOf({ errorCode: '0', isOtpValidated: true });
  }

  public sendOtp$(_payload: OnlineSendOtpResponse): Observable<OnlineSendOtpResult> {
    return mockOf({ errorCode: '0', isOtpSent: true });
  }

  public checkOtp$(_payload: OnlineCheckOtpResponse): Observable<OnlineCheckOtpResult> {
    return mockOf({ errorCode: '0', isOtpValidated: true });
  }

  public getApplication$(applicationId: number): Observable<OnlineApplication> {
    const application = MOCK_APPLICATIONS_BY_ID[applicationId];

    if (!application) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: `Mock application ${applicationId} not found` },
          }),
      ).pipe(delay(MOCK_DELAY_MS));
    }

    return mockOf(application);
  }

  public getOffers$(applicationId: number): Observable<OnlineOffer[]> {
    return mockOf(MOCK_OFFERS_BY_ID[applicationId] ?? []);
  }

  public claimLoan$(payload: ClaimLoanPayload): Observable<ClaimLoanResult> {
    const application = MOCK_APPLICATIONS_BY_ID[payload.applicationId];
    const listItem = MOCK_APPLICATIONS_LIST.find((item) => item.id === payload.applicationId);

    if (application) {
      if (payload.isAccepted) {
        const selected =
          MOCK_OFFERS_BY_ID[payload.applicationId]?.find((offer) => offer.offerId === payload.offerId) ??
          MOCK_OFFERS_BY_ID[payload.applicationId]?.[0];

        application.sysStatusId = ApplicationStatus.OnDesign;
        application.offerId = payload.offerId;
        application.docs = [
          {
            id: 101,
            type: 'LOAN_DECISION',
            isSigned: false,
            createdDate: '2026-09-10T10:00:00',
            signedDate: '2026-09-30',
          },
        ];

        if (selected) {
          application.product = {
            loanAmount: selected.loanAmount,
            loanRate: selected.loanRate,
            loanTerm: selected.loanTerm,
            monthlyPayment: selected.loanAmount / selected.loanTerm,
            paymentType: selected.paymentType,
            product: selected.product,
          };

          if (listItem) {
            listItem.sysStatusId = ApplicationStatus.OnDesign;
            listItem.loanAmount = selected.loanAmount;
            listItem.loanTerm = selected.loanTerm;
            listItem.rate = selected.loanRate;
            listItem.paymentType = selected.paymentType;
          }
        } else if (listItem) {
          listItem.sysStatusId = ApplicationStatus.OnDesign;
        }
      } else {
        application.sysStatusId = ApplicationStatus.DeclineClient;
        application.docs = [];

        if (listItem) {
          listItem.sysStatusId = ApplicationStatus.DeclineClient;
        }
      }
    }

    return mockOf({
      is_show_toastr: true,
      statusCode: '0',
      statusDesc: payload.isAccepted ? 'Accepted (mock)' : 'Declined (mock)',
      statusTitle: 'OK',
    });
  }

  public checkOneId$(): Observable<boolean> {
    return mockOf(true);
  }

  public getApplications$(): Observable<OnlineGetInfoResult[]> {
    return mockOf(MOCK_APPLICATIONS_LIST);
  }

  public getBranches$(): Observable<OnlineBranchesResult> {
    return mockOf(MOCK_ONLINE_BRANCHES);
  }

  public startProcessing$(_payload: StartProcessingPayload): Observable<StartProcessingResult> {
    return mockOf({
      is_show_toastr: true,
      statusCode: '0',
      statusDesc: 'Application created (mock)',
      statusTitle: 'OK',
    });
  }

  public getFile$(_fileId: number): Observable<string> {
    return of('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf').pipe(delay(MOCK_DELAY_MS));
  }

  public checkEligibility$(): Observable<EligibilityResult> {
    return mockOf({ eligible: true });
  }
}
