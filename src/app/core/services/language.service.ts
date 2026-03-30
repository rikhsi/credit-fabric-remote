import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { LocalStorageService } from './local-storage.service';
import { Language, LocalStorageItem } from '@constants';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  get currentLang() {
    return this.translocoService.getActiveLang() as Language;
  }

  constructor(
    private translocoService: TranslocoService,
    private lsService: LocalStorageService,
  ) {}

  public onChangeLang(lang: string, reload: boolean = false): void {
    this.translocoService.setActiveLang(lang);

    this.lsService.setItem(LocalStorageItem.Language, lang);

    if (reload) {
      window.location.reload();
    }
  }
}
