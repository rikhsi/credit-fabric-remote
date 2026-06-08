import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component, HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {ChildrenOutletContexts, Router, RouterOutlet} from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { routeAnimation } from './core/animations/route.animation';
import { SpinnerComponent } from './core/components/spinner/spinner.component';
import { UserService } from './core/services/user.service';
import { UtilsService } from './core/services/utils.service';
import { NotificationService } from "./core/services/notification.service";
import { NewHeaderComponent } from "./core/components/new-header/new-header.component";
import { NewMenuListComponent } from "./views/main/new-menu-list/new-menu-list.component";
import { IconRegistryService } from './core/services/icon-registry.service';
import { languages } from './constants';
import {MatDialog} from "@angular/material/dialog";
import {
  ChatConversationComponent
} from "./views/main/features/chat/components/chat-conversation/chat-conversation.component";
import {IdleService} from "./core/services/idle.service";
import {
  ServiceControllerCheckComponent
} from "./core/components/service-controller-check/service-controller-check.component";
import {
  ToastrProgressContainerComponent
} from "./shared/components/toastr-progress-container/toastr-progress-container.component";
import {ServiceControllerStore} from "./core/components/service-controller-check/service-controller.store";
import {FirebaseAnalyticsService, UserProperties} from "../../firebase-analytics.service";
import { getAuthFlowId, getUserId, removeAuthFlowId } from './core/utils';
import {FingerprintProvider} from "./providers/fingerprint.provider";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [routeAnimation],
  imports: [
    CommonModule,
    RouterOutlet,
    SpinnerComponent,
    NewHeaderComponent,
    NewMenuListComponent,
    ServiceControllerCheckComponent,
    ToastrProgressContainerComponent
  ],
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private unsub$ = new Subject<void>();
  isAuth: boolean = false;
  isLeftMenu = false;
  languages = languages
  constructor(
    private _contexts: ChildrenOutletContexts,
    private _userService: UserService,
    public utilsService: UtilsService,
    public router: Router,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    // don't remove iconRegistryService from here.It injected to register icons
    private iconRegistryService: IconRegistryService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private idleService: IdleService,
    private fingerprintProvider: FingerprintProvider,
    private analyticsService: FirebaseAnalyticsService
  ) {
    const userLocalData = this._userService.getUserLocalData();
    if (!userLocalData) return;
    const userData = JSON.parse(userLocalData);
    this._userService.userLoginData$$.next(userData);

  }

  protected get routeAnimationData(): string {
    return this._contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
  @HostListener('window:beforeunload')
  handleClose() {
    const webOpen = localStorage.getItem('web_window');
    if (webOpen) {
      const screenSizeX = window?.screen?.width;
      const screenSizeY = window?.screen?.height;
      this.analyticsService.logFirebaseCustomEvent('web_close',
        {
          ScreenSizeX: screenSizeX,
          ScreenSizeY: screenSizeY
        }
        );
      localStorage.removeItem('web_window');
    }
  }

  ngOnInit(): void {
    this.webOpenEvent()
    console.log('window.location.pathname ', window.location.pathname)

    this.fingerprintProvider.init();
    if (this._userService.getToken() !== null && window.location.hostname !== 'localhost' &&
      window.location.origin !== 'https://corp-dev.hamkorbank.uz') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.idleService.startWatching();
        }
      });
      window.addEventListener('focus', () => {
        this.idleService.startWatching();
      });

      window.addEventListener('pageshow', () => {
        this.idleService.startWatching();
      });
    }
    this.initLanguage()
    this.initUser();
    this.notificationService.getMessage();
    this.adblockDetected()
    this.analyticsService.logFirebaseCustomEvent('app_open',null)

    if(window.location.pathname !== '/auth') {
      let obj:UserProperties = {}
      if(getAuthFlowId()) {
          obj.auth_flow_id = getAuthFlowId()
      }
      if(getUserId()) {
        obj.user_id = getUserId()
      }

      this.analyticsService.setUserProperties(obj)
    }
  }
  adblockDetected(){
    const hasAdBlock = this.detectAdBlock();
    if (hasAdBlock) {
      this.analyticsService.logFirebaseCustomEvent('adblock_detected', {
        platform: 'web'
      });
    }
  }
  detectAdBlock(): boolean {
    const bait = document.createElement('div');
    bait.className = 'adsbox';
    bait.style.position = 'absolute';
    bait.style.left = '-999px';
    bait.style.height = '1px';

    document.body.appendChild(bait);

    const isBlocked = bait.offsetHeight === 0;

    document.body.removeChild(bait);

    return isBlocked;
  }
  webOpenEvent(){
    const webOpen = localStorage.getItem('web_window');
    if (!webOpen) {
      const screenSizeX = window?.screen?.width;
      const screenSizeY = window?.screen?.height;
      this.analyticsService.logFirebaseCustomEvent('web_open',
        {
          ScreenSizeX: screenSizeX,
          ScreenSizeY: screenSizeY
        });
      localStorage.setItem('web_window', 'open');
    }
  }
  private initLanguage() {
    this.translate.addLangs(['ru', 'en', 'uz-Cyrl', 'uz-Latn', 'zh']);
    const lang = localStorage.getItem("lang");
    if (!lang) {
      localStorage.setItem('langForBackend', 'RUS')
      this.translate.use('ru');
      localStorage.setItem('lang', 'ru');
      return;
    } else {
      let langForUi = this.languages.find(item => item.key === lang)?.value || 'RUS';
      localStorage.setItem('langForBackend', langForUi)
      this.translate.use(lang.match(/ru|en|uz-Cyrl|uz-Latn|zh/) ? lang : 'ru');
    }
  }

  checkUrl() {
    return window.location.pathname === '/profile/change-business' || window.location.pathname === '/new-locations';
  }

  initUser() {
    this._userService.userLoginData$.pipe(takeUntil(this.unsub$)).subscribe((user) => {
      this.isAuth = !!user;
        if(user?.hashedBusinessId) {
          removeAuthFlowId()
          let obj:UserProperties = {
            'business_id':user?.hashedBusinessId,
            'auth_flow_id':null
          }
          if(user.role.length) {
            obj.role =user?.role[0].name
          }
          if (getUserId()) {
                obj.user_id = getUserId();
              }

          this.analyticsService.setUserProperties(obj)
        }
    });
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
  }
  openChat(){
    this.dialog.closeAll()
    this.dialog.open(ChatConversationComponent, {
      width: '540px',
      height: 'calc(100% - 16px)',
      position: {
        right: '0',
      },
      panelClass: 'right-side-dialog',
    })

  }
  isSettingsPage(): boolean {
    return this.router.url.startsWith('/settings');
  }
}
