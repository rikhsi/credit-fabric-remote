import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';



@Injectable({
  providedIn: 'root',
})

export class UtilsService {
  menuState$$ = new BehaviorSubject<string>('main');
  spinnerState$$ = new BehaviorSubject<boolean>(false);

  updateTransactions = new Subject<string>();
}


export function detectBrowserFull(): string {
  if (typeof window !== 'undefined' && window.navigator) {
    const ua = window?.navigator?.userAgent || '';
      if (!ua) return '';
    if (/Brave/i.test(ua)) return 'Brave';
    if (/OPR|Opera/i.test(ua)) return 'Opera';
    if (/Edg/i.test(ua)) return 'Edge';
    if (/Vivaldi/i.test(ua)) return 'Vivaldi';
    if (/YaBrowser/i.test(ua)) return 'Yandex';
    if (/Firefox|FxiOS/i.test(ua)) return 'Firefox';
    if (/Chrome|CriOS/i.test(ua)) return 'Chrome';
    if (/Safari/i.test(ua) && !/Chrome|CriOS|OPR|Edg/i.test(ua)) return 'Safari';
    if (/UCBrowser/i.test(ua)) return 'UC Browser';
    if (/SamsungBrowser/i.test(ua)) return 'Samsung Internet';
    if (/QQBrowser/i.test(ua)) return 'QQ Browser';
    if (/Maxthon/i.test(ua)) return 'Maxthon';
    if (/Baidu/i.test(ua)) return 'Baidu Browser';
    if (/Internet Explorer|Trident/i.test(ua)) return 'Internet Explorer';

  }

  return '';
}

