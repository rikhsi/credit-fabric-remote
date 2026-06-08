import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/development';

@Injectable({ providedIn: 'root' })
export class TranslocoProvider implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(environment.mode !== 'development' ? `/sme-kk-js/i18n/${lang}.json` : `i18n/${lang}.json`);
  }
}
