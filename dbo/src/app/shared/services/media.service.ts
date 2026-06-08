import { Injectable } from '@angular/core';
import {from, of, BehaviorSubject} from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private hasCameraSubject = new BehaviorSubject<boolean>(false);
  hasCamera$ = this.hasCameraSubject.asObservable();

  checkCamera(): void {
    if (!navigator.mediaDevices?.enumerateDevices) {
      this.hasCameraSubject.next(false);
      return;
    }

    from(navigator.mediaDevices.enumerateDevices())
      .pipe(
        map(devices => devices.some(d => d.kind === 'videoinput')),
        catchError(() => of(false))
      )
      .subscribe(result => this.hasCameraSubject.next(result));
  }
}
