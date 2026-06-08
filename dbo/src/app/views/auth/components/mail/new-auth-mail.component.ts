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
import { Subject, takeUntil } from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {UserService} from 'src/app/core/services/user.service';
import {UtilsService} from 'src/app/core/services/utils.service';

import {AuthService} from '../../services/auth.service';
import {NotificationService} from "../../../../core/services/notification.service";
import {AgreeDialogComponent} from "../../../../core/components/agree-dialog/agree-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import { ActivatedRoute, Router } from '@angular/router';
import {StyxService} from "../../../../core/services/styx.service";
import { UpdateStyxComponent } from '../../../../shared/components/update-styx/update-styx.component';
import {AUTH_SMS_STEP, languages} from 'src/app/constants';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import {NgxMaskDirective, provideNgxMask, NgxMaskPipe} from "ngx-mask";
import {UiOtpInputComponent} from "../../../../core/components/ui-otp-input/ui-otp-input.component";
import {NewAuthBusinessComponent} from "../businessList/new-auth-business.component";
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {IdleService} from "../../../../core/services/idle.service";
import {ErrorModalComponent} from "../../../../shared/components/error-modal/error-modal";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ThemeService} from "../../../../shared/services/theme.service";
import {BlockModalComponent} from "../../modals/block-modal.component";
import {FirebaseAnalyticsService} from "../../../../../../firebase-analytics.service";
import { getAuthFlowId } from 'src/app/core/utils';

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    UiOtpInputComponent,
    NewAuthBusinessComponent,
    NgIf,
    NgClass,
    TranslateModule,
    NgForOf,
    NgOptimizedImage,
  ],
  providers: [provideNgxMask()],
  templateUrl: './new-auth-mail.component.html',
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
export class NewAuthMailComponent implements OnInit, OnDestroy {
  serialNumber = signal('')
  styxInfos = signal<Array<{company: string ,fio: string ,serialnumber: string ,thumbprint: string}>>([])

  unsub$ = new Subject<void>();
  loginStep: 'login' | 'esp' | 'selectBusiness' | 'code' | 'password' | string = 'login';
  focusLogin = false;
  focusPassword = false;
  isOpen = false;
  identityTokenNew = '';
  timer = 60;
  intervalId!: NodeJS.Timer;
  step = '';
  phone = '';
  businessKeys: { businessId: number, businessName: string }[] = [];
  private socket$!: WebSocketSubject<any>;
  loginForm = this.fb.nonNullable.group({
    login: [''],
    code: ['', Validators.minLength(6)],
    espKey: '',
    businessId: null as unknown as number,
    businessName: '',
    identityToken: '',
  });
  incorrectCode = signal('');
  isForgetPassword = signal<boolean>(false)
  lang = signal('ru');
  mode = signal<string>('')
  selectedLang = signal<string>("RUS")
  languages = languages

  alvaGroupSign = "MIIGXgYJKoZIhvcNAQcCoIIGTzCCBksCAQExEDAOBgoqhlwDDwEDAgEBBQAwTwYJKoZIhvcNAQcBoEIEQGV5SnNiMmRwYmlJNklqazVPRGt3TURBd01UVTBPU0lzSW5CaGMzTjNiM0prSWpvaU1USXpORFUyTnpnaWZRPT2gggTzMIIE7zCCAtegAwIBAgIIQV/0frv4Rf0wDQYJKoZIhvcNAQELBQAwDTELMAkGA1UEAwwCSVQwHhcNMjQxMjEwMDAwMDAwWhcNMjkwNjEzMDQwMDAwWjCCAVkxIDAeBgNVBAMMF0FYTUFEQUxJWUVWIEEuIFNILiBPLiAyMRwwGgYDVQQKDBNPT08gQUxWQSBHUk9VUCBMSU5FMQswCQYDVQQGEwJVWjEYMBYGA1UECwwPVVpDMDU1MDU2MTYxNjMyMR4wHAYJKoZIhvcNAQkBFg9leGFtcGxlQG1haWwucnUxRzBFBgNVBAcMPtCR0LDRhdC+0YAg0JzQpNCZINCR0YPQtzIg0LzQsNCy0LfQtdGB0LggONGD0LkgMdGF0L7QvdCw0LTQvtC9MQkwBwYDVQQEDAAxRzBFBgNVBAkMPtCR0LDRhdC+0YAg0JzQpNCZINCR0YPQtzIg0LzQsNCy0LfQtdGB0LggONGD0LkgMdGF0L7QvdCw0LTQvtC9MRswGQYHKoZcAxABAgwOMzE0MDg5NTU5MTAwNDUxFjAUBgcqhlwDEAEBDAkzMTAyNDc5MTMwYDAZBgkqhlwDDwEBAgEwDAYKKoZcAw8BAQIBAQNDAARAN/Jouj1qoLdWkbJD/NAU6Z5UldKd9Fna8wPjl4/d0C0XodDlgehiA+ZT5LxCc+AQpgcVKfFC9EPSD9bUJBmbOqOByDCBxTAUBgNVHSABAf8ECjAIMAYGBFUdIAAwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwQwHQYDVR0OBBYEFEAImaiRuiW51PpQb7duaclGWD6pMB8GA1UdIwQYMBaAFFBRcYHJrXCaujESEGtDSEZSm3rxMB8GA1UdHwQYMBaAFFBRcYHJrXCaujESEGtDSEZSm3rxMCQGCCsGAQUFBwEBBBgwFoAUUFFxgcmtcJq6MRIQa0NIRlKbevEwDgYDVR0PAQH/BAQDAgTwMA0GCSqGSIb3DQEBCwUAA4ICAQCTLnG5Mc6+1SKAwWDpjykV7+eB3Rv4A2AkqvU1AX/9EeSOvYAx8B2YpcZnjWkZTfw+jDomb1swXRlE/6DISxBx+/mK7p+LLx5MW3BJsD2RV67JJEyKBL4ppQQ/ySSqahZy1w/HSHXAgWMR0GDxE7W6oO3/HxQ6tgogTIFTkcSQahl7/MOjxrDITB2Zu8egTv/N5/C9+GllcO7gQ4jHPWwYcybKDKRVtUmuObd1jEOugwoZitV1t5JPcm34u0Wa+kMzfvlrcBH4xTZ7opOLVjBPk3t122ilq8HTpuhizQncW86qt5XpBgPE7TZ2hmwwc7xuM2msxT+sRTYYoTqwaMkxr3S7YpErR4wGm6XN2pmfeXvIsU41HO26JsdJtOVYl3wnpRjszfaugGcfNQGEZ6Jvx4d8JDdQHKcF4VY49oYXAWsUS4Zjl67ZPevzdK/Ke9wCIKmoqCvfscbTJs/uE1zWcOX9y/GlxjBTYUOm4CdfXQm4LsMZBGtskcVI3ZoGdHiyzPvocYs17NZoJ3UHJlRjQXWbGXV9jyF7NiOJbXsBHW2y6kXk7wAyQDDKY/r8BxPQbLJ7NljSmqayIJdp921yI5stN2Ix639tqTKV2Jq7FUy5M2EpmMustYQEQ4g9xogLMssCRGP6xKw6S8D++rnJ9YrpSM0UzfaxaxkaM+Ks5TGB6zCB6AIBATAZMA0xCzAJBgNVBAMMAklUAghBX/R+u/hF/TAOBgoqhlwDDwEDAgEBBQCgaTAYBgkqhkiG9w0BCQMxCwYJKoZIhvcNAQcBMBwGCSqGSIb3DQEJBTEPFw0yNTAxMDYwNzU3MDNaMC8GCSqGSIb3DQEJBDEiBCBHe9OZ5rztZGEj+4OAdCue7qTkgEt2HJ8IrYNObOYJ9jALBgkqhlwDDwEBAgEEQBZEP4rnCbdImwHeW1Ylizk5yH37Q0zle9waKc1rEZyQPt2zsErkTONVzZy9hUuFWNi90cWQwzYIWnSkfVizMrU="



  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cf: ChangeDetectorRef,
    private userService: UserService,
    private destroyRef: DestroyRef,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private _notificationService: NotificationService,
    private _dialog: MatDialog,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    private idleService: IdleService,
    private styxService:StyxService,
    public theme: ThemeService,
    private translate:TranslateService,
    private analyticsService: FirebaseAnalyticsService,
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
      console.log(this.languages.find(item => item.key === lang)?.value)
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
    window.onpopstate = () => {
      this.router.navigate(['/auth']);
    };
    let modeValue = this.activatedRoute.snapshot.queryParams['mode']
    this.isForgetPassword.set(modeValue === AUTH_SMS_STEP.FORGET_PASSWORD)
    this.mode.set(modeValue)
    this.startCounter();
    this.checkFromRegistration();
    this.loginForm.get('code')?.valueChanges
      .pipe(
      )
      .subscribe(value => {
        this.incorrectCode.set('');
        if (value.length === 6) {
          if (modeValue === 'forgetPassword') {
            this.verifyCodeCreate()
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
  changeInput (): void {
    this.incorrectCode.set('')
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
    const identityToken = this.identityTokenNew
    console.log(identityToken, "toekn")
    this.utilsService.spinnerState$$.next(true);
    this.authService.verifyBussiness({identityToken, businessId})
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          if(res) {
            localStorage.setItem("lastActivity", JSON.stringify(Date.now()))
            this._notificationService.requestPermission();
            this.userService.setUserData(res);
            this.idleService.startWatching();
            this.cf.detectChanges();
          }
        },
        error: (err) => {
          this._dialog.open(ErrorModalComponent, {
            data: {
              errorMessage: err
            }
          })
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

  signUp() {
    this.utilsService.spinnerState$$.next(false);
    this.toastrService.info('Пользователь не найден!');
    const dialog = this._dialog.open(AgreeDialogComponent, {
      data: {
        title: 'Пользователь не найден!',
        text: 'Хотите зарегистрироваться?'
      },
    });
    dialog.afterClosed().pipe(takeUntil(this.unsub$)).subscribe((res) => {
      if (res === 'success') window.open(`https://corp.hamkor.uz/onboard?from=${window.location.origin}`, '_blank')
    });
  }

  MyIDStatus = {
    EXCEPTION: -1,
    IN_PROGRESS: 0,
    LIVENESS_PASSED: 1,
    LIVENESS_FAILED: 2,
    RETRY: 3,
    EXITED: 4,

    LOADING: 100,
    LOADED: 101,
  };
  handleOtp(otp: any): void {
    this.loginForm.patchValue({code: otp});
  }

  verifyCodeCreate() {

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
              this._dialog.open(BlockModalComponent, {
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
            this._dialog.open(BlockModalComponent, {
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

  verifyCode() {
    let {code} = this.loginForm.getRawValue();
    this.utilsService.spinnerState$$.next(true);
    this.authService.loginConfirm({ code: code, identity: this.activatedRoute.snapshot.queryParams['identityToken']})
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          this.analyticsService.logFirebaseCustomEvent('authorization_email_code_enter', {result:'success',auth_flow_id:getAuthFlowId()});
          this.analyticsService.logFirebaseCustomEvent('authorization_success', {authorization_way: "pin"});

          if (res.blockModel) {
                this.analyticsService.logFirebaseCustomEvent(
                            'authentication_user_blocked',
                            { reason: 'otp_attempt_limit',result:'success' ,auth_flow_id:getAuthFlowId()},
                            'auth'
                          );

            if (res.blockModel.forever) {
              this._dialog.open(BlockModalComponent, {
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
            this._dialog.open(BlockModalComponent, {
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
        },
        error: (err) => {
          this.analyticsService.logFirebaseCustomEvent('authorization_email_code_enter', { auth_flow_id:getAuthFlowId(), result:'error',error_code:err.code,error_message:err.message});
          this.incorrectCode.set(err.message);
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
          this.timer = 60;
          this.startCounter()
          this.cf.detectChanges();
        },
        error: (err) => {
          this._dialog.open(ErrorModalComponent, {
            data: {
              errorMessage: err
            }
          })
          this.utilsService.spinnerState$$.next(false);
          this.cf.markForCheck();
        }
      })
  }
  updateStyx() {
    const dialogRef = this._dialog.open(UpdateStyxComponent, {
      width: '600px',
    });
  }

  // alvaGroupSignIn() {
  //   if(this.loginStep !== 'esp') return;
  //   let {username,password,identityToken, businessId} = this.loginForm.getRawValue();
  //
  //   const digest = btoa(JSON.stringify({ login: username, password }));
  //
  //   this.authService.verifyEsp(this.alvaGroupSign, digest, identityToken, businessId)
  //     .pipe(takeUntil(this.unsub$))
  //     .subscribe((userData) => {
  //       if(userData) {
  //         this._notificationService.requestPermission();
  //         this.userService.setUserData(userData);
  //       }
  //     });
  // }

  // verifyEsp() {
  //   let {username,password,identityToken, businessId} = this.loginForm.getRawValue();
  //
  //   const digest = btoa(JSON.stringify({ login: username, password }));
  //
  //   this.styxService.getSign({login: username, password }, this.loginForm.value.espKey,'')
  //     .then((res2:any)=>{
  //       if (res2.status){
  //         this.utilsService.spinnerState$$.next(true);
  //
  //         this.authService.verifyEsp(res2.message, digest, identityToken, businessId)
  //           .pipe(takeUntil(this.unsub$))
  //           .subscribe({
  //             next: (userData) => {
  //               if(userData) {
  //                 this._notificationService.requestPermission();
  //                 this.userService.setUserData(userData);
  //               }
  //               this.utilsService.spinnerState$$.next(false);
  //             },
  //             error: (err) => {
  //               this.toastrService.error(err.message || 'Что-то пошло не так!');
  //               this.utilsService.spinnerState$$.next(false);
  //             }
  //           });
  //       }
  //     })
  //     .catch(e => {
  //       console.log('sign error', e);
  //     });
  // }


  loadEspKeys() {
    this.styxService.getInfo()
      .then((res1:any)=> {
        if (res1.status) {
          this.styxInfos.set(res1.infos)
          if (res1.infos.length > 0) {
            // this.formModel.patchValue({
            //   clientThumb: res1.infos[0].thumbprint
            // })
          }
          if (window.navigator.platform === 'MacIntel') {
            this.serialNumber.set(res1.infos[0].serialnumber)
            localStorage.setItem('serial_number', this.serialNumber())
          }
        } else {
          this.styxInfos.set([]);
          this.toastrService.error(res1.message);
        }
      })
      .catch((error) => {
        this.toastrService.error(error);
      });
  }

  setValuesToForm(name: string, event: any, type: 'input' | 'text'){
    const value = type === 'input' ?  event.target.value : event;
    this.loginForm.patchValue({ [name]: value  })
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
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

  backAction() {
    if (this.loginStep === 'selectBusiness') {
      this.loginStep = 'login'
    } else if (this.loginStep === 'code') {
      this.loginStep = 'code'
    } else if (this.loginStep === 'esp') {
      this.loginStep = 'selectBusiness'
    }
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
