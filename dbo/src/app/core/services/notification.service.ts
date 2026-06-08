import {Injectable} from "@angular/core";
import {AngularFireMessaging} from "@angular/fire/compat/messaging";
import { BehaviorSubject, catchError, map, mergeMapTo, Observable, of, Subject } from 'rxjs';

import {ToastrService} from "ngx-toastr";

import {environment} from "../../../environments/environment";
import {BackendResponse} from "../models/backend-response.model";
import { HttpClient } from "@angular/common/http";
import {SessionService} from "./session.service";
import {
  NotificationContent,
  NotificationOne,
  NotificationsDto
} from '../../views/main/features/notifications/models/notifications.model';
import {
  NotificationDetailsComponent
} from '../../views/main/features/notifications/components/notification-details/notification-details.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from './user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {NotificationSoundService} from "./notification-sound.service";
import {AccountStore} from "../../store/account.store";
import {NewToastComponent} from "../components/new-toast/new-toast.component";

@Injectable({
  providedIn: 'root'
})


export class NotificationService {
  currentMessage  = new BehaviorSubject(null)
  private API_URL = `${environment.API_BASE}`;

  read$$ = new Subject<boolean>();
  readAll$$ = new Subject<boolean>();

  reportsReady$$ = new Subject();

  constructor(
    private afMessaging:AngularFireMessaging,
    private toast:ToastrService,
    private soundService: NotificationSoundService,
    private _http: HttpClient,
    private _sessionService: SessionService,
    private _dialog: MatDialog,
    private userService: UserService,
    private accountStore: AccountStore
  ) {

  }

  watchLogout() {
    const token = localStorage.getItem('')
    this.userService.logout$$
      .subscribe(fcmToken => {
        this.afMessaging.deleteToken(fcmToken)
          .subscribe(() => {
            console.log('FCM Token deleted')
          })
      })
  }

  getMessage(){
    this.afMessaging.messages.subscribe(
      (message:any) => {
        this.soundService.play();
        this.currentMessage.next(message);
        this.accountStore.loadUnreadCount()
        this.showNotification(message)
      },
      (error) => {
        console.error(error);
      }
    );
  }
  showNotification(payload:any) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      image: payload.notification.image
    };
    const toaster = this.toast.success(notificationOptions.body, notificationTitle,{
      positionClass:'toast-bottom-right',
      closeButton: true,
      tapToDismiss:false,
      toastClass: 'toast success-no-after',
      toastComponent: NewToastComponent,
    });
    (toaster.toastRef.componentInstance as NewToastComponent).image = notificationOptions?.image || '';

    if(notificationTitle === "Ваш запрос готов!") {
      this.reportsReady$$.next(true);
    }

    toaster.onTap.subscribe(() => {
      this.openNotification(payload);
    });
  }

  openNotification(data: {notification: NotificationContent}): void {
    const dialog = this._dialog.open(NotificationDetailsComponent, {
      data: {
        ...data,
        unread: true,
      },
      width:'375px',
      minHeight:'400px'
    });
  }

  requestPermission() {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        this.afMessaging.tokenChanges.pipe(
          catchError((error) => {
            console.error('Error retrieving token:', error);
            return of(null);
          })
        ).subscribe((token) => {
          if (token) {
            localStorage.setItem('x-fcm-token', token);
            this.watchLogout();
            this.getTopic(token).pipe(
              catchError((error) => {
                console.error('Error sending token to backend:', error);
                return of(null);
              })
            ).subscribe(() => {
              console.log('Token successfully sent to backend');
            });
          } else {
            console.error('No token retrieved');
          }
        });
      } else {
        console.error('Permission denied for notifications');
      }
    }).catch((error) => {
      console.error('Error requesting notification permission:', error);
    });
  }

  getCount(query:boolean = false): Observable<{msg:number} | null> {
    return this._http.get<BackendResponse<{msg:number}>>(`${this.API_URL}/core/notification/get/count?isRead=${query}`)
      .pipe(map(this._sessionService.handleResponse<{msg:number}>),
        catchError(this._sessionService.handleError)
      );
  }

  getAllNotifications(paging: { page: number, size: number }, type: string | null = 'NEWS'): Observable<NotificationsDto | null> {
    return this._http.post<BackendResponse<NotificationsDto>>(`${this.API_URL}/core/notification/get/all`,
      {
        ...paging,
        type,
      }
      )
      .pipe(map(this._sessionService.handleResponse<NotificationsDto>),
        catchError(this._sessionService.handleError)
      );
  }
  getOneNotification(notificationId:number): Observable<NotificationOne | null> {
    return this._http.get<BackendResponse<NotificationOne>>(`${this.API_URL}/core/notification/get/one?id=${notificationId}`)
      .pipe(map(this._sessionService.handleResponse<NotificationOne>),
        catchError(this._sessionService.handleError)
      );
  }
  readNotification(notificationId:number): Observable<{msg:string} | null> {
    return this._http.get<BackendResponse<{msg:string}>>(`${this.API_URL}/core/notification/read/one?id=${notificationId}`)
      .pipe(map(this._sessionService.handleResponse<{msg:string}>),
        catchError(this._sessionService.handleError)
      );
  }
  notifyReadAll(): Observable<{msg:string} | null> {
    return this._http.get<BackendResponse<{msg:string}>>(`${this.API_URL}/core/notification/read/all`)
      .pipe(map(this._sessionService.handleResponse<{msg:string}>),
        catchError(this._sessionService.handleError)
      );
  }
  getTopic(token:any): Observable<any> {
    return this._http.get<any>(`${this.API_URL}/api/identity/v1/auth/token/subscribe/topic`,{headers:{'x-fcm-token':token}}).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
  checkServiceController(services: string[]): Observable<any> {
    return this._http.post<any>(`${this.API_URL}/api/core-transaction/v1/service-control/check`, {
      services,
    }).pipe(
      map(this._sessionService.handleResponse<any>),
      catchError(this._sessionService.handleError)
    );
  }
}
