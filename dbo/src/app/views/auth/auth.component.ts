import {NgClass, NgForOf, NgIf, NgOptimizedImage, Location} from '@angular/common';
import { effect } from '@angular/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef,
  OnDestroy,
  OnInit,
  signal, ViewChild
} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {NgxMaskDirective} from 'ngx-mask';
import {ToastrService} from 'ngx-toastr';
import {filter, Subject, take, takeUntil} from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {UserService} from 'src/app/core/services/user.service';
import {UtilsService} from 'src/app/core/services/utils.service';

import {AuthService} from './services/auth.service';
import {NotificationService} from "../../core/services/notification.service";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from '@angular/router';
import {StyxService} from "../../core/services/styx.service";
import {
  trigger,
  transition,
  style,
  animate, group,
  query,
} from '@angular/animations';
import {BlockModalComponent} from "./modals/block-modal.component";
import {ErrorModalComponent} from "../../shared/components/error-modal/error-modal";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import { MatSelectModule } from '@angular/material/select';
import { AUTH_SMS_STEP, handleFirebaseLanguage, languages, languageTypes } from 'src/app/constants';
import {EspSignConfirmComponent} from "../../core/components/esp-sign-confirm/esp-sign-confirm.component";
import {ThemeService} from "../../shared/services/theme.service";
import {MatTooltip} from "@angular/material/tooltip";
import {MediaService} from "../../shared/services/media.service";
import {RsaOaepService } from "../../shared/services/rsa-oaep.service";
import {FirebaseAnalyticsService} from "../../../../firebase-analytics.service";
import { generateUUID, getAuthFlowId, removeUserDataAfterUserCheck, setAuthFlowId } from 'src/app/core/utils';

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    NgIf,
    NgxMaskDirective,
    NgClass,
    TranslateModule,
    MatSelectModule,
    MatFormFieldModule,
    NgForOf,
    NgOptimizedImage,
    MatTooltip,
  ],
  templateUrl: './auth.component.html',
  styles:`
  .lang-selector .dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.lang-selector .dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.lang-selector .dropdown-menu::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.lang-selector .dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.lang-selector-glass {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.lang-selector-minimal button {
  border: none;
  background: transparent;
}

.lang-selector-minimal button:hover {
  background: rgba(0, 0, 0, 0.05);
}
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({opacity: 0, transform: 'scaleY(0)'}),
        animate('200ms ease-out', style({opacity: 1, transform: 'scaleY(1)'})),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({opacity: 0, transform: 'scaleY(0)'})),
      ]),
    ]),
    trigger('passwordToggle', [
      transition(':enter', [
        style({height: 0, opacity: 0, transform: 'translateY(-10px)'}),
        animate(
          '250ms ease-out',
          style({height: '*', opacity: 1, transform: 'translateY(0)'})
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({height: 0, opacity: 0, transform: 'translateY(-10px)'})
        ),
      ]),
    ]),
    trigger('modalAnimation', [
      transition(':enter', [
        group([
          query(':self', [
            style({opacity: 0}),
            animate('200ms ease-out', style({opacity: 1})),
          ]),
          query('.modal', [
            style({transform: 'translate(-50%, -45%)', opacity: 0}),
            animate(
              '250ms ease-out',
              style({transform: 'translate(-50%, -50%)', opacity: 1})
            ),
          ]),
        ]),
      ]),
    ]),
  ]
})
export class AuthComponent implements OnInit, OnDestroy {
  serialNumber = signal('')
  styxInfos = signal<Array<{ company: string, fio: string, serialnumber: string, thumbprint: string }>>([])
  chooseType = signal(false)
  showPassword = signal(false);
  incorrectErrorCount = signal(3);
  incorrectError = signal(false);
  incorrectErrorPhone = signal('');
  confirmTypes = signal<{ contact: string, type: string }[]>([])
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
languages = languages
  codeReceived = false;
  passwordExists: boolean = false;
  isOtpIncorrect = false;
  unsub$ = new Subject<void>();
  loginStep: 'login' | 'esp' | 'selectBusiness' | 'code' | 'password' | string = 'login';
  isOpen = false;
  phone = '';
  lang = signal('ru');
  hasWebCamera = signal(false);
  publicKey = signal<string>('');
  businessKeys: { businessId: number, businessName: string }[] = [];
  private socket$!: WebSocketSubject<any>;
  loginForm = this.fb.nonNullable.group({
    // login: [''],
    username: ['', Validators.required],
    password: ['', this.passwordExists ? [Validators.required, Validators.minLength(1)] : []],
    // code: ['', Validators.minLength(6)],
    espKey: '',
    businessId: null as unknown as number,
    businessName: '',
    identityToken: '',
  });

  selectedLang = signal<string>("RUS")


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    protected cf: ChangeDetectorRef,
    private userService: UserService,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private _notificationService: NotificationService,
    private _dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    protected router: Router,
    private styxService: StyxService,
    private translate:TranslateService,
    private location: Location,
  public theme: ThemeService,
    public mediaService: MediaService,
    private rsaService: RsaOaepService,
    private analyticsService: FirebaseAnalyticsService,
  ) {
    effect(() => {
      if (this.chooseType()) {
        this.mediaService.checkCamera();

        this.mediaService.hasCamera$
          .pipe(
            filter(hasCamera => hasCamera),
            take(1)
          )
          .subscribe(() => {
            this.hasWebCamera.set(true);
          });
      }
    });
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
    removeUserDataAfterUserCheck()
    setAuthFlowId(generateUUID())
    this.analyticsService.logFirebaseCustomEvent(
    'authentication_start',{'auth_flow_id':getAuthFlowId()},
    'auth'
  );

  this.analyticsService.setUserProperties({'auth_flow_id':getAuthFlowId()})

    const selectTypes = localStorage.getItem('select-types');
    if (selectTypes) {
      this.confirmTypes.set(JSON.parse(selectTypes))
    }
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.unsub$))
      .subscribe(params => {
        if (params['identityToken']) {
          this.loginForm.patchValue({
            identityToken: params['identityToken']
          })
          this.chooseType.set(true)
        }
      });
    const validLangs = ['ru', 'en', 'uz-Cyrl', 'uz-Latn', 'zh'];
    const storedLang = localStorage.getItem('lang');

    const language = validLangs.includes(storedLang!) ? storedLang! : 'ru';
    this.lang.set(language);
    const id = crypto.randomUUID();
    const uuidFromStorage = localStorage.getItem('x-uuid');
    if (!uuidFromStorage) {
      localStorage.setItem('x-uuid', id)
    }

    this.checkFromRegistration();
  }
  deleteFromQueryIdentity() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { identityToken: null },
      queryParamsHandling: 'merge'
    });
  }

  onLangChange(value: string) {
    let valueForUI = this.languages.find(item => item.key === value)?.value || 'RUS';
     this.analyticsService.logFirebaseCustomEvent(
    'app_language_selected',
    { language: handleFirebaseLanguage(valueForUI as languageTypes) },
    'auth'
  );
    this.selectedLang.set(valueForUI);
    localStorage.setItem('langForBackend', valueForUI)
    localStorage.setItem('lang', value);
    this.switchLanguage(value)
    location.reload()
  }



  switchLanguage(lang: string) {
    this.translate.use(lang);
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

  get availableLanguages() {
    return this.languages.filter(item => item.value !== this.selectedLang());
  }



  togglePassword() {
    if (this.passwordExists) {
      setTimeout(() => {
        const el = document.querySelector('input[formControlName="password"]') as HTMLInputElement;
        el?.focus();
      }, 0);
    }
  }

  showPass() {
    this.showPassword.update(v => !v)
  }

  checkFromRegistration() {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (val) => {
          if (val['successfullyRegistered'] === '1') {
            this.toastrService.success('Успешно зарегистрированы, можете войти в интернет-банк!');
            this.router.navigate([], {
              relativeTo: this.activatedRoute,
              queryParams: {successfullyRegistered: null},
              queryParamsHandling: 'merge'
            });
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.unsub$?.next();
    this.unsub$?.complete();
    this.socket$?.complete();
  }

  checkUser() {


    let {username} = this.loginForm.getRawValue();
    this.utilsService.spinnerState$$.next(true);
    this.authService.userCheckPhoneNumber(username)
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next:(res: any) => {
          if(res.hashedUserId) {
            setTimeout(() => {
               sessionStorage.setItem('userDataAfterUserCheck',JSON.stringify(res))
               this.analyticsService.setUserProperties({'user_id':res.hashedUserId})
            }, 0);
          this.analyticsService.logFirebaseCustomEvent(
          'authentication_phone_check',
          {
            result: 'success',
            auth_flow_id:getAuthFlowId()
            },
          'auth'
          );
          }else {
            sessionStorage.removeItem('userDataAfterUserCheck')
          }
          this.incorrectErrorPhone.set('');
          if (res.blockModel) {
            if (res.blockModel.forever) {
              this.analyticsService.logFirebaseCustomEvent(
                'authentication_user_blocked',
                { reason: 'phone_check_attempt_limit',result:'success' ,auth_flow_id:getAuthFlowId()},
                'auth'
              );
              this._dialog.open(BlockModalComponent, {
                width: '540px',
                data: {
                  forever: true,
                  reason:'phone_check_attempt_limit'
                }
              }).afterClosed().subscribe(() => {
                this.passwordExists = false;
                this.loginForm.reset();
                this.incorrectErrorCount.set(3);
                this.incorrectError.set(false);
                this.cf.detectChanges();
              })
              return;
            }
              this.analyticsService.logFirebaseCustomEvent(
                'authentication_user_blocked',
                { reason: 'phone_check_attempt_limit',result:'success' ,auth_flow_id:getAuthFlowId()},
                'auth'
              );
            this._dialog.open(BlockModalComponent, {
              width: '540px',
              data: {
                blockedTime: res.blockModel.blockedTime,
                remainingTime: res.blockModel.remainingTime,
                  reason:'phone_check_attempt_limit'
              }
            }).afterClosed().subscribe(() => {
              this.passwordExists = false;
              this.loginForm.reset();
              this.incorrectErrorCount.set(3);
              this.incorrectError.set(false);
              this.cf.detectChanges();
            })
          } else {
            localStorage.setItem("publicKey", res.encryptKey)
            if (res.passwordExists) {
              this.publicKey.set(res.encryptKey);
              this.passwordExists = res.passwordExists
              this.loginForm.controls.identityToken.patchValue(res.identity)
              this.togglePassword();
              this.incorrectErrorCount.set(3);
              this.incorrectError.set(false);
              this.cf.detectChanges();
            } else {
              this.analyticsService.logFirebaseCustomEvent(
                'authorization_password_sms_code_open',
                {
                  result: 'success',
                  auth_flow_id:getAuthFlowId(),
                  flow_reason: 'new_user_setup',

                },
              );
              this.router.navigate(['/auth/sms-check'], {
                queryParams: {
                  maskedPhone: res.maskedPhone,
                  identityToken: res.identity,
                  type: 'create',
                  mode:AUTH_SMS_STEP.NEW_USER_SETUP
                }
              })
            }
          }

          // const {identityToken, maskedPhone} = res;
          // this.router.navigate(['/auth/sms-check'], { queryParams:  { identityToken: identityToken, maskedPhone: maskedPhone }})
          // // this.loginForm.controls.identityToken.patchValue(identityToken);
          // this.cf.markForCheck();
        },
        error: (err) => {
          // this.toastrService.error(err);
           this.analyticsService.logFirebaseCustomEvent(
          'authentication_phone_check',
          {
            auth_flow_id:getAuthFlowId(),
            result: 'error',
            error_code:err.code,
            error_message:err.message
            },
          'auth'
        );
          this.analyticsService.logFirebaseCustomEvent(
            'authentication_phone_check_error',
            {
              auth_flow_id:getAuthFlowId(),
            },
          );
         this.incorrectErrorPhone.set(err.message)
          this.utilsService.spinnerState$$.next(false);
          this.cf.markForCheck();
        }
      })
  }

  loginCheck() {
    let {identityToken, password} = this.loginForm.getRawValue();
    const valuesToEncrypt = {
      password: password,
    };
    this.utilsService.spinnerState$$.next(true);
    this.rsaService.encryptValues(
      valuesToEncrypt,
      this.publicKey()
    ).then( (encrypted: any) => {
      this.authService.userCheckLogin({ identity: identityToken, encPassword: encrypted?.password})
        .pipe(takeUntil(this.unsub$))
        .subscribe({
          next: (res: any) => {

            if(res && res.blockModel == null) {
                this.analyticsService.logFirebaseCustomEvent(
                'authentication_user_login',
                { result:'success',auth_flow_id:getAuthFlowId()},
                'auth'
              );
            }

            if (res.blockModel) {
               this.analyticsService.logFirebaseCustomEvent(
                'authentication_user_blocked',
                { reason: 'password_attempt_limit',result:'success' ,auth_flow_id:getAuthFlowId()},
                'auth'
              );
              if (res.blockModel.forever) {

                this._dialog.open(BlockModalComponent, {
                  width: '540px',
                  data: {
                    forever: true,
                    reason:'password_attempt_limit'
                  }
                }).afterClosed().subscribe(() => {
                  this.passwordExists = false;
                  this.loginForm.reset();
                  this.incorrectErrorCount.set(3);
                  this.incorrectError.set(false);
                  this.cf.detectChanges();
                })

                return;
              }
              this._dialog.open(BlockModalComponent, {
                width: '540px',
                data: {
                  blockedTime: res.blockModel.blockedTime,
                  remainingTime: res.blockModel.remainingTime,
                  reason:'password_attempt_limit'
                }
              }).afterClosed().subscribe(() => {
                this.passwordExists = false;
                this.loginForm.reset();
                this.incorrectErrorCount.set(3);
                this.incorrectError.set(false);
                this.cf.detectChanges();
              })

            } else if (res.needChangePassword) {
              this.loginForm.patchValue({
                identityToken: res.identity,
              })
              this.cf.detectChanges();
              this.sendToForgotPassword()
            } else {
              this.chooseType.set(true);
              this.confirmTypes.set(res.types);
              localStorage.removeItem('publicKey');
              localStorage.setItem('select-types', JSON.stringify(res.types));
              this.loginForm.controls.identityToken.patchValue(res.identity);
              this.cf.detectChanges();
            }
          },
          error: (err) => {
            console.log('=>>>>>>>>>>>>>>>>>>>>>>SULAYMON ERROR',err)
            this.analyticsService.logFirebaseCustomEvent('authorization_failed', {platform: "web"});
                this.analyticsService.logFirebaseCustomEvent(
                'authentication_user_login',
                {
                  result:'error',
                  error_code:err.code,
                  error_message:err.message,
                  auth_flow_id:getAuthFlowId()
                },
                'auth'
              );
            this.utilsService.spinnerState$$.next(false);
            this.cf.markForCheck();
            this.incorrectError.set(true);
            this.incorrectErrorCount.update(prev => prev - 1);
            this.cf.detectChanges();
          }
        })
    }) ;
  }

  showSelections(_type: string) {
    return true;
  }
  selectionValues(type: string) {
    return this.confirmTypes()?.find(item => item.type === type)?.contact;
  }


  selectType(type: string) {


 const eventMap: Record<string, string> = {
    'SMS':       'authorization_sms_button_click',
    'EMAIL':     'authorization_email_button_click',
    'MYID':      'authorization_myid_button_click',
    'ERP':       'authorization_virtual_electronic_signature_button_click',
    'MOBILE_QR': 'authorization_via_mobile_qr_click',
    'BANK': 'authorization_bank_branch_click',
  };

  if (eventMap[type]) {
    this.analyticsService.logFirebaseCustomEvent(
      eventMap[type],
      null,
      'auth'
    );
  }

    let {identityToken} = this.loginForm.getRawValue();
    this.utilsService.spinnerState$$.next(true);
    this.authService.userCheckTypes(identityToken, type)
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          if (res) {
            if (type === 'SMS') {
              this.router.navigate(['/auth/sms-check'], {
                queryParams: {
                  identityToken: res.identity,
                  maskedPhone: res.contact,
                  mode:AUTH_SMS_STEP.PRE_BUSINESS_SELECTION
                }
              })
            } else if (type === 'EMAIL') {
              this.router.navigate(['/auth/mail-check'], {
                queryParams: {
                  identityToken: res.identity,
                  maskedPhone: res.contact
                }
              })
            } else if (type === 'MYID') {
              this.router.navigate(['/auth/my-id'], {
                queryParams: {
                  identityToken: res.identity,
                  sessionId: res.sessionId
                }
              })
            } else if (type === "ERP") {
              this.utilsService.spinnerState$$.next(true);
              this.deleteFromQueryIdentity()
              this.chooseType.set(false);
              this._dialog.open(EspSignConfirmComponent, {
                  width: '560px',
                  data: {
                    pinfl: this.selectionValues('ERP'),
                    action: {
                      isAuth: true,
                      identityToken: res.identity
                    },
                    transaction: {}
                  },
              }).afterClosed().subscribe(() => {
                this.loginForm.patchValue({
                  identityToken: this.activatedRoute.snapshot.queryParams['identityToken']
                });
              })
            } else if (type === "MOBILE_QR") {
              this.router.navigate(['/auth/qr-sign'], {queryParams: {identityToken: res.identity, link: res.deeplink}})
            } else if (type === 'BANK') {
              this.router.navigate(['/auth/branches'], { queryParams: {
                  identityToken: res.identity,
                }});
            }
            this.utilsService.spinnerState$$.next(false);
            // const {identityToken, maskedPhone} = res;
            // this.router.navigate(['/auth/sms-check'], { queryParams:  { identityToken: identityToken, maskedPhone: maskedPhone }})
            // // this.loginForm.controls.identityToken.patchValue(identityToken);
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
      })
  }

  verify() {
    let {identityToken, businessId} = this.loginForm.getRawValue();
    this.utilsService.spinnerState$$.next(true);
    this.authService.verifyBussiness({identityToken, businessId})
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          if (res) {
            this._notificationService.requestPermission();
            this.userService.setUserData(res);
            // if(!res.withKey) {
            //   this.loginStep = 'code';
            //
            //   this.loginForm.get('code')!.setValidators(Validators.required);
            //   this.loginForm.get('code')!.updateValueAndValidity();
            //
            //   this.loginForm.patchValue({
            //     identityToken: res.identityToken,
            //   })
            //
            //   this.phone = res.message.split('+')[1]
            //   this.codeReceived = true;
            //   this.cf.detectChanges();
            // } else {
            //   this.loginStep = 'esp';
            //   this.loadEspKeys();
            this.cf.detectChanges();
            // }
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


  loadEspKeys() {
    this.styxService.getInfo()
      .then((res1: any) => {
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

  setValuesToForm(name: string, event: any, type: 'input' | 'text') {
    const value = type === 'input' ? event.target.value : event;
    this.loginForm.patchValue({[name]: value})
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  sendToForgotPassword() {
   this.analyticsService.logFirebaseCustomEvent(
    'authentication_forgot_password_click',
   {auth_flow_id:getAuthFlowId()},
    'auth'
  );
    let {identityToken} = this.loginForm.getRawValue();
    this.authService.forgotPassword({identity: identityToken})
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          if (res) {

            this.router.navigate(['/auth/sms-check'], {
              queryParams: {
                maskedPhone: res.maskedPhone,
                identityToken: res.identity,
                type: 'create',
                mode:AUTH_SMS_STEP.FORGET_PASSWORD
              }
            })

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
    if (this.loginForm.invalid) return;
    if (this.passwordExists) {
      this.loginForm.markAllAsTouched();
      if (this.loginForm.invalid) return;
      this.analyticsService.logFirebaseCustomEvent('authorization_continue_button_click', null);

      this.loginCheck()
    } else {
      this.checkUser();
    }
    // switch (this.loginStep) {
    //   case 'login':
    //     this.checkUser();
    //     break;
    //   case 'selectBusiness':
    //     this.verify();
    //     break;
    //   case 'code':
    //     this.verifyCode();
    //     break;
    //   case 'esp':
    //     this.verifyEsp();
    // }
  }

sendPhoneEvent() {
  this.analyticsService.logFirebaseCustomEvent(
    'authorization_call_bank_click',
    null,
    'auth'
  );
}

}
