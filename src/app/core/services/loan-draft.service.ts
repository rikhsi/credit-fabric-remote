import { inject, Injectable } from '@angular/core';
import { SessionStorageService } from './session-storage.service';
import { SessionStorageItem } from '@app/constants/session-storage';
import { StartProcessingPayload } from '@api/models/los/start-processing';

/**
 * Holds the loan detail form while the user leaves for OneID.
 * The draft lives in the session only and is dropped on app start, so a reload always starts a fresh application.
 */
@Injectable({
  providedIn: 'root',
})
export class LoanDraftService {
  private readonly sessionStorage = inject(SessionStorageService);

  public save(payload: StartProcessingPayload): void {
    this.sessionStorage.setItem(SessionStorageItem.LoanDraft, payload);
  }

  public read(): StartProcessingPayload | null {
    return this.sessionStorage.getItem<StartProcessingPayload>(SessionStorageItem.LoanDraft);
  }

  public clear(): void {
    this.sessionStorage.removeItem(SessionStorageItem.LoanDraft);
  }
}
