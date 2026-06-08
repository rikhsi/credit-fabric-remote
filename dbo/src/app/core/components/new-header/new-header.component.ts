import { ToastrProgressService } from 'src/app/shared/services/toastr-progress.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  computed,
  signal, TemplateRef,
  ViewChild
} from '@angular/core';
import { AccountService } from "../../services/account.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { take } from "rxjs";
import { AuthService } from "../../../views/auth/services/auth.service";
import { UserService } from "../../services/user.service";
import { AsyncPipe, NgClass, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { NavigationStart, Router, RouterLink, RouterLinkWithHref } from "@angular/router";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { appTabs } from "../../../views/main/features/applications/constants/app-tab";
import { MatOption } from "@angular/material/autocomplete";
import { MatSelect } from "@angular/material/select";
import { MatFormField } from "@angular/material/form-field";
import { animate, style, transition, trigger } from '@angular/animations';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import {MatDialog, MatDialogClose} from '@angular/material/dialog';
import { AgreeDialogComponent } from '../agree-dialog/agree-dialog.component';
import { UtilsService } from '../../services/utils.service';
import { NotificationService } from '../../services/notification.service';
import { ToastrService } from 'ngx-toastr';
import { WebSocketSubject } from 'rxjs/webSocket';
import { NewAuthBusinessComponent } from 'src/app/views/auth/components/businessList/new-auth-business.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {NotificationsDialogComponent} from "./dialogs/notifications-dialog/notifications-dialog.component";
import { languages } from 'src/app/constants';
// import {UiSvgIconComponent} from "../ui-svg-icon/ui-svg-icon.components";
import {IdleService} from "../../services/idle.service";
import { HeaderDownloadIndicatorComponent } from "./header-download-indicator/header-download-indicator.component";
import {AccountStore} from "../../../store/account.store";
import {FirebaseAnalyticsService} from "../../../../../firebase-analytics.service";
import {ThemeService} from "../../../shared/services/theme.service";

@Component({
  selector: 'app-new-header',
  imports: [
    NgIf,
    AsyncPipe,
    MatIconModule,
    NgClass,
    FormsModule,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    MatFormField,
    NgForOf,
    SvgIconComponent,
    NewAuthBusinessComponent,
    RouterLinkWithHref,
    RouterLink,
    TranslateModule,
    HeaderDownloadIndicatorComponent,
    MatDialogClose
  ],
  templateUrl: './new-header.component.html',
  styleUrls: ['./new-header.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ transform: 'translateY(-50px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-50px)', opacity: 0 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewHeaderComponent implements OnInit {
  @ViewChild('dialogTemplateExpired') dialogTemplateExpired!: TemplateRef<any>;
  protected readonly router = inject(Router)
  private toastrProgressService = inject(ToastrProgressService)
  private readonly accountService = inject(AccountService);
  private readonly _authService = inject(AuthService)
  protected readonly userService = inject(UserService)
  private _dialog = inject(MatDialog)
  readonly #destroy = inject(DestroyRef)
  private cdr = inject(ChangeDetectorRef)
  private utilsService = inject(UtilsService)
  private _notificationService = inject(NotificationService)
  private toastrService = inject(ToastrService)
  private idleService = inject(IdleService)
  private fb = inject(FormBuilder)
  readonly accountStore = inject(AccountStore)
  theme = inject(ThemeService)

  subMenu = signal<boolean>(true)
  isSettingsPage = signal(this.router.url.includes('/settings'))
  passwordMessage = signal<boolean>(false)
  leftDaysToExpirePassword = signal<number>(0)
  /** i18n key for banner body: ru (день/дня/дней), en (day/days), default main.password_expires_in_days */
  passwordExpiresInDaysTranslationKey = computed(() => {
    const days = this.leftDaysToExpirePassword();
    const lang = this.translate.currentLang;
    if (lang === 'ru') {
      const form = NewHeaderComponent.russianDayPluralForm(days);
      return `main.password_expires_in_days_ru_${form}`;
    }
    if (lang === 'en') {
      return days === 1
        ? 'main.password_expires_in_days_en_one'
        : 'main.password_expires_in_days_en_other';
    }
    return 'main.password_expires_in_days';
  });
  hardPasswordMessage = signal<boolean>(false)
  selectedLang = signal<string>("RUS")
  // public readonly docDate = signal<string>('')
  // public readonly docDateInvalid = signal<boolean>(false)

  // public readonly docDateTime = signal<string>('')
  // public readonly docDateTimeInvalid = signal<boolean>(false)
  isPanelOpen = signal(false)
  isOperDayOpen = signal(false)
  languages = languages

  operDaYTime = signal<any>({})
  serialNumber = signal('')
  styxInfos = signal<Array<{ company: string, fio: string, serialnumber: string, thumbprint: string }>>([])

  timer = 59;
  intervalId!: NodeJS.Timer;
  isOpen = false;
  phone = '';
  businessKeys: { businessId: number, businessName: string }[] = [];
  private socket$!: WebSocketSubject<any>;
  loginForm = this.fb.nonNullable.group({
    code: ['', Validators.minLength(6)],
  });

  constructor(
    private translate: TranslateService,
    private analyticsService: FirebaseAnalyticsService,
    private dialog: MatDialog,
  ) {
    translate.addLangs(['ru', 'en', 'uz-Cyrl', 'uz-Latn', 'zh']);
    const lang = localStorage.getItem("lang");
    if (!lang) {
      this.selectedLang.set('RUS');
      localStorage.setItem('langForBackend', 'RUS')
      translate.use('ru');
      localStorage.setItem('lang', 'ru');
      return;
    } else {
      let langForUi = this.languages.find(item => item.key === lang)?.value || 'RUS';
      this.selectedLang.set(langForUi);
      localStorage.setItem('langForBackend', langForUi)
      translate.use(lang.match(/ru|en|uz-Cyrl|uz-Latn|zh/) ? lang : 'ru');
    }
  }



  ngOnInit(): void {
    this.accountStore.loadUnreadCount()
    this.getOperationDay()
    this.getUserInfo()
    this.router.events
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.subMenu.set(event.url.split('/')[1] !== 'settings');
          this.isSettingsPage.set(event.url.includes('/settings'));
          this.cdr.markForCheck();
        }
      });

    this.getBusinessAll()
    // this.userService.userLoginData$.subscribe(res => {
    //   console.log('userLoginData', res)
    // })
    // this.userService.userInfo$.subscribe(res => {
    //   console.log('userInfo', res)
    // })
  }

  push() {
    const channel = new BroadcastChannel('notify-channel');
    channel.postMessage({ type: 'NEW_NOTIFICATION'});
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }


  getBusinessAll() {
    this._authService.getAllBusiness().pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res) => {
          if (res) {
            this.businessKeys = res.content
            this.cdr.detectChanges();
          }
        }
      })
  }


  navigateSetting() {
    this.router.navigate(['/settings/my-profile'])
    this.isPanelOpen.set(false)
  }
  verify(businessId: number) {
    this.utilsService.spinnerState$$.next(true);
    this._authService.businessInit(businessId)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (res: any) => {
          if (res) {
            if (res?.hashedBusinessId){
               this.analyticsService.setUserProperties({'business_id':res.hashedBusinessId})
              // this.analyticsService.setUserFirebaseCustomEvent(res?.hashedBusinessId)
              // this.analyticsService.setUserPropertiesFirebaseCustomEvent(res?.hashedBusinessId)
              this.analyticsService.logFirebaseCustomEvent('change_business_success', { screen: "mai" })
            }
            this._notificationService.requestPermission();
            this.userService.setUserData(res, true);
            this.router.navigate(['/main']).then(() => {
              window.location.reload();
            });
            this.cdr.detectChanges();
            // }
          }
        },
        error: (err) => {
          this.toastrService.error(err);
          this.utilsService.spinnerState$$.next(false);
          this.cdr.markForCheck();
        }
      });
  }



  logout() {
    const dialog = this._dialog.open(AgreeDialogComponent, {
      data: {
        title:  `${this.translate.instant('new_second.logout')}` ,
        text: `${this.translate.instant('new_second.are_you_sure_you_want_to_log_out')}`,
        isMatIcon: false,
        icon: 'hamkor_logout-03',
        iconColor: 'red'
      },
    });

    dialog.afterClosed()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((res) => {
        if (res === 'success') {
          this.userService.logout();
          this.idleService.stopWatching();
        }
      });
  }


  togglePanel() {
    this.isPanelOpen.update(v => !v)
  }
  toggleOperDay() {
    this.isOperDayOpen.update(v => !v)
  }
  toggleCard() {

  }

  detectLang(): void {
    const lang = localStorage.getItem("lang");
    this.selectedLang.set(lang ? lang : "RUS");
  }
  onLangChange(value: string) {
    let valueForUI = this.languages.find(item => item.key === value)?.value || 'RUS';
    this.selectedLang.set(valueForUI);
    localStorage.setItem('langForBackend', valueForUI)
    localStorage.setItem('lang', value);
    this.switchLanguage(value)
    location.reload()
  }
  getOperationDay() {
    // this.accountService.getOperDayNew()
    //   .pipe(takeUntilDestroyed(this.#destroy))
    //   .subscribe(val => {
    //     if (val) {
    //
    //       this.docDateInvalid.set(val.actual)
    //       this.docDate.set(val?.operDay.toString())
    //       this.docDate.update(value => 'Открыт до' + ' ' + value)
    //     }
    //   })


    this.accountService.getOperDayTimeNew().pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(res => {
        if (res) {
          this.operDaYTime.set(res)
        }
      })
  }


  getUserInfo() {
    this._authService.getUserInfoV2()
      .pipe(take(1))
      .subscribe(res => {
        this.leftDaysToExpirePassword.set(res?.leftDaysToExpirePassword || 0)
        if ((!res?.leftDaysToExpirePassword || res?.leftDaysToExpirePassword <= 0) && res?.passwordExpireNotify) {
          this.openPasswordExpiredModal()
        }else if (res?.leftDaysToExpirePassword && res?.passwordExpireNotify) {
           this.passwordMessage.set(true)
         }

        this.userService.userInfo$$.next(res);
        localStorage.setItem("businessInfo", JSON.stringify(res));
      });
  }
  selectedLangTitle() {
    switch (this.selectedLang()) {
      case 'RUS':
        return "РУ"
      case 'UZB':
        return "O’zb"
      case 'KRL':
        return "Ўзб"
      case 'ENG':
        return "ENG"
      case 'CHN':
        return "中文"
    }
    return '';
  }
  openNotificationsDialogs(){
    this._dialog.closeAll()
    this._dialog.open(NotificationsDialogComponent, {
      data: {  },
      width: 'auto',
      height: 'calc(100% - 16px)',
      position: {
        right: '0'
      },
      panelClass: 'right-side-dialog',
    })
  }
  get availableLanguages() {
    return this.languages.filter(item => item.value !== this.selectedLang());
  }


  openPasswordExpiredModal() {
    this.dialog.open(this.dialogTemplateExpired, {
      panelClass: 'password-expired-dialog',
      width: '540px',
      disableClose: true,
    });
  }
  redirectChangePasswordPage(){
    this.dialog.closeAll()
    this.passwordMessage.set(false)
    this.router.navigate(['/settings/security'])
  }
  protected readonly types = appTabs;

  /** Russian plural for «день»: 1 день, 2–4 дня (кроме 12–14), иначе дней */
  private static russianDayPluralForm(n: number): 'one' | 'few' | 'many' {
    const abs = Math.abs(Math.trunc(n));
    const n100 = abs % 100;
    const n10 = abs % 10;
    if (n100 > 10 && n100 < 20) return 'many';
    if (n10 === 1) return 'one';
    if (n10 >= 2 && n10 <= 4) return 'few';
    return 'many';
  }
}
