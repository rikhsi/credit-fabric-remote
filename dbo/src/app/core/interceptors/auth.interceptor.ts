import { HttpInterceptorFn } from '@angular/common/http';
  import { inject } from '@angular/core';

import { UserService } from '../services/user.service';
import {detectBrowserFull} from "../services/utils.service";

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const userService = inject(UserService);
  const token = userService.getToken();
  if (request.url.includes('/refresh-token')) {
    return next(request);
  }
  let selectedLang = localStorage.getItem('langForBackend') || 'RUS';
  const uuid = localStorage.getItem('x-uuid');
  const deviceModel = detectBrowserFull()
  if (request.url.includes('/api/reports/v1')) {
    if (selectedLang === 'RUS') {
      selectedLang = 'ru-RU';
    } else if (selectedLang === 'UZB') {
      selectedLang = 'uz-Latn';
    } else if (selectedLang === 'KRL') {
      selectedLang = 'uz-Cyrl';
    } else if (selectedLang === 'ENG') {
      selectedLang = 'en';
    }
  }

  if (token) request = request.clone({ headers: request.headers.set('x-auth-token', `${token}`)});
  request = request.clone({ headers: request.headers.set('X-DEVICE-TYPE', 'web').set('X-Device-ID', `${uuid}`).set('X-Device-Model', `${deviceModel}`).set('X-Lang', (selectedLang ==='CHN' ? "RUS" : selectedLang)) })
  return next(request);
};
