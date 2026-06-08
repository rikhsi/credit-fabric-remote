import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, signal} from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {ActivatedRoute, Router} from "@angular/router";
import { QRCodeComponent } from 'angularx-qrcode';
import {animate, style, transition, trigger} from "@angular/animations";
import {TransactionService} from "../../../../core/services/transaction.service";
import {UtilsService} from "../../../../core/services/utils.service";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {ThemeService} from "../../../../shared/services/theme.service";
import { languages } from 'src/app/constants';
import {Subject, takeUntil} from "rxjs";
import {AuthService} from "../../services/auth.service";
import {FirebaseAnalyticsService} from "../../../../../../firebase-analytics.service";

@Component({
  selector: 'app-qr-sign',
  imports: [
    QRCodeComponent,
    TranslateModule,
    NgOptimizedImage,
    NgForOf,
    NgIf,
  ],
  templateUrl: './qr-sign.component.html',
  styleUrls: ['./qr-sign.component.scss'],
  animations: [
    trigger('dialogAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class QrSignComponent implements OnInit, OnDestroy {
  safePdfUrl!: SafeResourceUrl;
  qrLink: string = '';
  timer = 60;
  intervalId!: NodeJS.Timer;
  interval: any;
  isOpen = false;
  unsub$ = new Subject<void>();
  selectedLang = signal<string>("RUS")
  languages = languages
  lang = signal('ru');
  constructor(
    private sanitizer: DomSanitizer,
    private utilsService: UtilsService,
    private transactionService: TransactionService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    private authService: AuthService,
    public theme: ThemeService,
    private translate:TranslateService,
    private analyticsService: FirebaseAnalyticsService,
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl("");
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
      console.log(this.languages.find(item => item.key === lang)?.value)
      this.selectedLang.set(langForUi);
      localStorage.setItem('langForBackend', langForUi)
      translate.use(lang.match(/ru|en|uz-Cyrl|uz-Latn|zh/) ? lang : 'ru');
    }
  }

  ngOnInit() {
     this.analyticsService.logFirebaseCustomEvent(
    'authorization_via_mobile_qr_open', {}
  );

    const storedLang = localStorage.getItem('lang');
    const validLangs = ['ru', 'en', 'uz-Cyrl', 'uz-Latn', 'zh'];
    const language = validLangs.includes(storedLang!) ? storedLang! : 'ru';
    this.lang.set(language);
    this.getQrCode();
    this.interval = setInterval(() => {
      this.getQrCode(false);
    }, 2000);
    // this.startCounter();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  // startCounter(): void {
  //   if (this.timer === 0) {
  //     this.stopCounter();
  //     return;
  //   }
  //   this.intervalId = setInterval(() => {
  //     if (this.timer === 0) {
  //       this.router.navigate(['/'])
  //       this.timer = 30
  //     } else {
  //       this.timer--
  //     }
  //
  //     this.cf.detectChanges();
  //   }, 1000);
  // }
  // stopCounter(): void {
  //   this.intervalId && clearInterval(this.intervalId as any);
  // }


  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  backToSelectType() {
    this.authService.userAnotherType(this.activatedRoute.snapshot.queryParams['identityToken']).pipe(takeUntil(this.unsub$)).subscribe(() => {
      this.router.navigate(['/auth'], { queryParams: { identityToken: this.activatedRoute.snapshot.queryParams['identityToken'] } })
    })
  }

  closeDropdown() {
    this.isOpen = false;
  }

  get availableLanguages() {
    return this.languages.filter(item => item.value !== this.selectedLang());
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


  onLangChange(value: string) {
    let valueForUI = this.languages.find(item => item.key === value)?.value || 'RUS';
    this.selectedLang.set(valueForUI);
    localStorage.setItem('langForBackend', valueForUI)
    localStorage.setItem('lang', value);
    this.switchLanguage(value)
    location.reload()
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  getQrCode(loading: boolean = true) {
    if (loading) {
      this.utilsService.spinnerState$$.next(true);
    }
    this.transactionService.getQrForAuth({ id: this.activatedRoute.snapshot.queryParams['identityToken'] }).pipe()
      .subscribe({
        next: result => {
        this.analyticsService.logFirebaseCustomEvent(
        'authorization_via_mobile_qr_select_business', {}
      );
          this.utilsService.spinnerState$$.next(false);
          localStorage.setItem('businessKeys', JSON.stringify(result.businessList));
          this.router.navigate(['/auth/sms-check'], { queryParams: { identityToken: result.identity, step: 'selectBusiness' } })
        },
        error: err => {
          this.utilsService.spinnerState$$.next(false);
        }
      })
  }
  sendPhoneEvent(){
    this.analyticsService?.logFirebaseCustomEvent('call_bank_button_click', null)
  }
  protected readonly Math = Math;
}
