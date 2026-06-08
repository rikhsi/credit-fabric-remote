import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {ToastrService} from 'ngx-toastr';
import {Subject, takeUntil} from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {UserService} from 'src/app/core/services/user.service';
import {UtilsService} from 'src/app/core/services/utils.service';

import {AuthService} from '../../services/auth.service';
import {NotificationService} from "../../../../core/services/notification.service";
import { ActivatedRoute, Router } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import {provideNgxMask} from "ngx-mask";
import {UiOtpInputComponent} from "../../../../core/components/ui-otp-input/ui-otp-input.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {NewAuthBusinessComponent} from "../businessList/new-auth-business.component";
import {IdleService} from "../../../../core/services/idle.service";
import {ErrorModalComponent} from "../../../../shared/components/error-modal/error-modal";
import {MatDialog} from "@angular/material/dialog";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ThemeService} from "../../../../shared/services/theme.service";
import { AUTH_SMS_STEP, languages } from 'src/app/constants';
import {BlockModalComponent} from "../../modals/block-modal.component";
import {FirebaseAnalyticsService} from "../../../../../../firebase-analytics.service";
import {getAuthFlowId, getUserId} from 'src/app/core/utils';


import {FingerprintProvider} from "../../../../providers/fingerprint.provider";

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    UiOtpInputComponent,
    NgClass,
    NgIf,
    NewAuthBusinessComponent,
    TranslateModule,
    NgOptimizedImage,
    NgForOf,
  ],
  providers: [provideNgxMask()],
  templateUrl: './new-auth-sms.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scaleY(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scaleY(0)' })),
      ]),
    ]),
  ]
})
export class NewAuthSmsComponent implements OnInit, OnDestroy {
  serialNumber = signal('')
  incorrectCode = signal('');
  smsFull = signal(false);
  incorrectErrorCount = signal(3);
  styxInfos = signal<Array<{company: string ,fio: string ,serialnumber: string ,thumbprint: string}>>([])
  selectedLang = signal<string>("RUS")
  languages = languages

  unsub$ = new Subject<void>();
  timer = 60;
  intervalId!: NodeJS.Timer;
  step = '';
  isOpen = false;
  phone = '';
  identityTokenNew = '';
  lang = signal('ru');
  businessKeys: { businessId: number, businessName: string }[] = [];
  private socket$!: WebSocketSubject<any>;
  loginForm = this.fb.nonNullable.group({
    code: ['', Validators.minLength(6)],
  });

  isForgetPassword = signal<boolean>(false)
  mode = signal<string>('')

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private idleService: IdleService,
    private cf: ChangeDetectorRef,
    private utilsService: UtilsService,
    private destroyRef: DestroyRef,
    private dialog: MatDialog,
    private toastrService: ToastrService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    private userService: UserService,
    private _notificationService: NotificationService,
    public theme: ThemeService,
    private translate:TranslateService,
    private analyticsService: FirebaseAnalyticsService,
    private fingerprintProvider: FingerprintProvider
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

  ngOnInit() {
    const storedLang = localStorage.getItem('lang');
    const validLangs = ['ru', 'en', 'uz-Cyrl', 'uz-Latn', 'zh'];
    const language = validLangs.includes(storedLang!) ? storedLang! : 'ru';
    this.lang.set(language);
    let modeValue = this.activatedRoute.snapshot.queryParams['mode']
    this.mode.set(modeValue)
    this.isForgetPassword.set(modeValue=== AUTH_SMS_STEP.FORGET_PASSWORD)
    if (this.activatedRoute?.snapshot?.queryParams && this.activatedRoute?.snapshot?.queryParams['type'] === 'create') {
      this.analyticsService.logFirebaseCustomEvent(
        'authentication_new_user_set_up',
        {
          auth_flow_id:getAuthFlowId(),
          user_hash_id: getUserId()
        },
      );
    }
    window.onpopstate = () => {
      this.router.navigate(['/auth']);
    };
    this.startCounter();
    this.checkFromRegistration();
    this.loginForm.get('code')?.valueChanges
      .pipe(
      )
      .subscribe(value => {
        this.incorrectCode.set('');
        if (value.length === 6 && !this.smsFull()) {
          if (this.activatedRoute.snapshot.queryParams['type'] === 'create') {
            this.verifyCodeCreate();
          } else {
            this.verifyCode();
          }
        }
      });
    this.activatedRoute.queryParams.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(query => {
        if (this.activatedRoute.snapshot.queryParams['step'] === 'selectBusiness') {
          this.step = query['step']
          this.businessKeys = JSON.parse(localStorage.getItem('businessKeys') as string);
          this.identityTokenNew = query['identityToken']
          this.cf.detectChanges();
        }
      })
  }

  selectTypeBack() {
    if (this.activatedRoute.snapshot.queryParams['mode'] === 'forgetPassword') {
      this.router.navigate(['/auth']);
    } else {
      this.authService.userAnotherType(this.activatedRoute.snapshot.queryParams['identityToken']).pipe(takeUntil(this.unsub$)).subscribe(() => {
        this.router.navigate(['/auth'], {queryParams: {identityToken: this.activatedRoute.snapshot.queryParams['identityToken']}})
      })
    }
  }

  backToSelectType() {
    if (this.activatedRoute.snapshot.queryParams['mode'] === 'forgetPassword') {
      this.authService.userForgotAlternative(this.activatedRoute.snapshot.queryParams['identityToken']).pipe(takeUntil(this.unsub$)).subscribe((res) => {
        this.router.navigate(['/auth/mail-check'], {
          queryParams: {
            identityToken: res.identity,
            maskedPhone: res.email,
            mode: 'forgetPassword'
          }
        })
      })
    } else {
      this.authService.userAnotherType(this.activatedRoute.snapshot.queryParams['identityToken']).pipe(takeUntil(this.unsub$)).subscribe(() => {
        this.router.navigate(['/auth'], { queryParams: { identityToken: this.activatedRoute.snapshot.queryParams['identityToken'] } })
      })
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
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

  startCounter(): void {
    if (this.timer === 0) {
      this.stopCounter();
      return;
    }
    this.intervalId = setInterval(() => {
      this.timer === 0 ? this.stopCounter() : this.timer--;
      this.cf.detectChanges();
    }, 1000);
  }

  stopCounter(): void {
    this.intervalId && clearInterval(this.intervalId as any);
  }

  verify(businessId: number) {
    const identityToken =  this.identityTokenNew
    this.utilsService.spinnerState$$.next(true);




    this.authService.verifyBussiness({identityToken, businessId})
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          console.log('BIZNESSSSSSS',res)
          if(res) {

            if (res?.hashedBusinessId){
                             this.analyticsService.setUserProperties({'business_id':res.hashedBusinessId})

              //  this.analyticsService.setUserFirebaseCustomEvent(res?.hashedBusinessId)
              //  this.analyticsService.setUserPropertiesFirebaseCustomEvent(res?.hashedBusinessId)
            }
            localStorage.setItem("lastActivity", JSON.stringify(Date.now()))
            this._notificationService.requestPermission();
            this.userService.setUserData(res);
            if (
              window.location.hostname !== 'localhost' &&
              window.location.origin !== 'https://corp-dev.hamkorbank.uz'
            ) {
              this.idleService.startWatching();
            }
            if (res.externalUserId){
              this.fingerprintProvider.setUser(res.externalUserId);
              this.fingerprintProvider.sendEvent('CDB_AUTHORIZATION');

            }
            this.router.navigate(['/main']);
            this.cf.detectChanges();
          }
          else {
            this.toastrService.error('Неизвестная ошибка');
          }
        },
        error: (err) => {
          this.toastrService.error(err)
          this.utilsService.spinnerState$$.next(false);
          this.cf.markForCheck();
        }
      });
  }

  checkFromRegistration() {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (val) => {
          if(val['successfullyRegistered'] === '1') {
            this.toastrService.success('Успешно зарегистрированы, можете войти в интернет-банк!');
            this.router.navigate([], {
              relativeTo: this.activatedRoute,
              queryParams: { successfullyRegistered: null },
              queryParamsHandling: 'merge' // keeps other query params
            });
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.unsub$?.next();
    this.unsub$?.complete();
    this.socket$?.complete();
    window.onpopstate = null;
  }

  handleOtp(otp: any): void {
    this.loginForm.patchValue({code: otp});
    this.cf.detectChanges();
  }
  changeInput (): void {
    this.incorrectCode.set('')
  }
  verifyCode() {
    this.smsFull.set(true);
    let {code} = this.loginForm.getRawValue();
    this.utilsService.spinnerState$$.next(true);
    this.authService.loginConfirm({ code: code, identity: this.activatedRoute.snapshot.queryParams['identityToken']})
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          console.log('ALOOOOOOO verifyCode SMS CODE',res)
          this.analyticsService.logFirebaseCustomEvent('authorization_sms_code_enter', {result:'success'});
          // this.analyticsService.logFirebaseCustomEvent('authorization_success', {authorization_way: "pin"});
          if (res.blockModel) {
                  this.analyticsService.logFirebaseCustomEvent(
                                       'authentication_user_blocked',
                                       { reason: 'otp_attempt_limit',result:'success' ,auth_flow_id:getAuthFlowId()},
                                       'auth'
                                     );
            if (res.blockModel.forever) {

              this.dialog.open(BlockModalComponent, {
                width: '540px',
                data: {
                  forever: true,
                  reason:'otp_attempt_limit'
                }
              }).afterClosed().subscribe(() => {
                this.router.navigate(['/auth'])
              })
              return;
            }
            this.dialog.open(BlockModalComponent, {
              width: '540px',
              data: {
                blockedTime: res.blockModel.blockedTime,
                remainingTime: res.blockModel.remainingTime,
                reason:'otp_attempt_limit'
              }
            }).afterClosed().subscribe(() => {
              this.router.navigate(['/auth'])
            })
          } else {
            const {businessList} = res;
            this.businessKeys = businessList;
            localStorage.setItem('businessKeys', JSON.stringify(businessList))
            this.identityTokenNew = res.identity
            if (res.needMyId) {
              this.router.navigate(['/new-auth/my-id'], { queryParams: { sessionId: res.sessionId, identityToken: res.identityToken } })
            } else {
              this.step = 'selectBusiness';
            }
            this.cf.detectChanges();
          }
          this.smsFull.set(false);
        },
        error: (err) => {
          console.log('NEW AUTH SMS ERR',err)
          this.analyticsService.logFirebaseCustomEvent('authorization_sms_code_enter',
             {
              result:'error',
              error_code:err.code,error_message:err.message,
            });

          this.smsFull.set(false);
          if (this.incorrectErrorCount() > 0) {
            this.incorrectErrorCount.update(prev => prev - 1);
          }
          this.incorrectCode.set(err.message);
          // this.dialog.open(ErrorModalComponent, {
          //   data: {
          //     errorMessage: err
          //   }
          // })
          this.utilsService.spinnerState$$.next(false);
          this.cf.markForCheck();
        }
      })
  }

  resendCode() {

    this.analyticsService.logFirebaseCustomEvent('authorization_sms_again_button_click', null);

    this.utilsService.spinnerState$$.next(true);
    this.authService[this.activatedRoute.snapshot.queryParams['type'] === 'create' ? 'resendUserCode' : 'resendCode'](this.activatedRoute.snapshot.queryParams['identityToken'])
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: () => {

          this.timer = 60
          this.startCounter()
          this.cf.detectChanges();
        },
        error: (err) => {
          this.dialog.open(ErrorModalComponent, {
            data: {
              errorMessage: err
            }
          })
          this.utilsService.spinnerState$$.next(false);
          this.cf.markForCheck();
        }
      })
  }

  verifyCodeCreate() {

    this.smsFull.set(true);
    let {code} = this.loginForm.getRawValue();
    this.utilsService.spinnerState$$.next(true);
    this.authService.verifySms({ otpCode: code, identity: this.activatedRoute.snapshot.queryParams['identityToken']})
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          console.log('FORGETT OR NEW ',res)
          if(!res.blockModel) {
              this.analyticsService.logFirebaseCustomEvent('authorization_password_sms_code_enter',
             {
              result:'success',
              flow_reason:this.isForgetPassword() ? 'forgot_password':'new_user_setup'
            });
          }
          if (res.blockModel) {
               this.analyticsService.logFirebaseCustomEvent(
                                       'authentication_user_blocked',
                                       { reason: 'otp_attempt_limit',result:'success' ,auth_flow_id:getAuthFlowId()},
                                       'auth'
                                     );

            if (res.blockModel.forever) {
              this.dialog.open(BlockModalComponent, {
                width: '540px',
                data: {
                  forever: true,
                  reason:'otp_attempt_limit'
                }
              }).afterClosed().subscribe(() => {
                this.router.navigate(['/auth'])
              })
              return;
            }
            this.dialog.open(BlockModalComponent, {
              width: '540px',
              data: {
                blockedTime: res.blockModel.blockedTime,
                remainingTime: res.blockModel.remainingTime,
                reason:'otp_attempt_limit'
              }
            }).afterClosed().subscribe(() => {
              this.router.navigate(['/auth'])
            })
          } else {
            this.router.navigate(['/auth/my-id'], { queryParams: { sessionId: res.sessionId, identityToken: res.identity, type: 'create', mode:this.mode()} })
          }
          this.smsFull.set(false);
          // const {businessList} = res;
          // this.businessKeys = businessList;
          // localStorage.setItem('businessKeys', JSON.stringify(businessList))
          // console.log(res, "res")
          // this.identityTokenNew = res.identity
          // if (res.needMyId) {
          //   this.router.navigate(['/new-auth/my-id'], { queryParams: { sessionId: res.sessionId, identityToken: res.identityToken } })
          // } else {
          //   this.step = 'selectBusiness';
          // }
          this.cf.detectChanges();
        },
        error: (err) => {
          this.smsFull.set(false);
          if (this.incorrectErrorCount() > 0) {
            this.incorrectErrorCount.update(prev => prev - 1);
          }

            this.analyticsService.logFirebaseCustomEvent('authorization_password_sms_code_enter',
             {
              result:'error',
              error_code:err.code,
              error_message:err.message,
              flow_reason: this.isForgetPassword() ? 'forgot_password' :'new_user_setup',
            });

          this.incorrectCode.set(err.message);
          // this.dialog.open(ErrorModalComponent, {
          //   data: {
          //     errorMessage: err
          //   }
          // })
          this.utilsService.spinnerState$$.next(false);
          this.cf.markForCheck();
        }
      })
  }




  submit() {
    this.loginForm.markAllAsTouched();
    if(this.loginForm.invalid) return;
    this.verifyCode();
  }
  sendPhoneEvent(){
    this.analyticsService?.logFirebaseCustomEvent('call_bank_button_click', null)
  }
}
