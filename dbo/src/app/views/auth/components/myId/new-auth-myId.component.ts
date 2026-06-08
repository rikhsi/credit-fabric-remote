import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ToastrService} from 'ngx-toastr';
import {Subject, takeUntil} from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {UserService} from 'src/app/core/services/user.service';
import {UtilsService} from 'src/app/core/services/utils.service';

import {AuthService} from '../../services/auth.service';
import {NotificationService} from "../../../../core/services/notification.service";
import {AgreeDialogComponent} from "../../../../core/components/agree-dialog/agree-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from '@angular/router';
import {StyxService} from "../../../../core/services/styx.service";
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import {provideNgxMask} from "ngx-mask";
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {NgIf, NgOptimizedImage} from "@angular/common";
import {ErrorModalComponent} from "../../../../shared/components/error-modal/error-modal";
import {TranslateModule} from "@ngx-translate/core";
import {ThemeService} from "../../../../shared/services/theme.service";
import { environment } from 'src/environments/environment';
import {FirebaseAnalyticsService} from "../../../../../../firebase-analytics.service";
import { getAuthFlowId } from 'src/app/core/utils';
import { AUTH_SMS_STEP } from 'src/app/constants';

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    NgIf,
    TranslateModule,
    NgOptimizedImage,
  ],
  providers: [provideNgxMask()],
  templateUrl: './new-auth-myId.component.html',
  styles: [],
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
  ]
})
export class NewAuthMyIdComponent implements OnInit, OnDestroy {
  safeUrl: SafeResourceUrl | null = null;
  serialNumber = signal('')
  visibleError = signal('')
  authCodeHandled = signal(false)
  styxInfos = signal<Array<{ company: string, fio: string, serialnumber: string, thumbprint: string }>>([])

  unsub$ = new Subject<void>();
  loginStep: 'login' | 'esp' | 'selectBusiness' | 'code' | 'password' | string = 'login';
  focusLogin = false;
  identityToken = '';
  isOpen = false;
  visible = signal(false)
  phone = '';
  myIdUrl = '';
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

    isForgetPassword = signal<boolean>(false)
  mode = signal<string>('')


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cf: ChangeDetectorRef,
    private userService: UserService,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private _notificationService: NotificationService,
    private _dialog: MatDialog,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    private styxService: StyxService,
    private sanitizer: DomSanitizer,
    public theme: ThemeService,
    private analyticsService: FirebaseAnalyticsService,
  ) {
  }

  ngOnInit() {
    window.onpopstate = () => {
      this.router.navigate(['/auth']);
    };
    let modeValue = this.activatedRoute.snapshot.queryParams['mode']
    this.mode.set(modeValue)
    this.isForgetPassword.set(modeValue=== AUTH_SMS_STEP.FORGET_PASSWORD)


    this.checkFromRegistration();
    window.addEventListener('message', this.myIdCheck)
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.MyId_BASE}/?iframe=true&session_id=${this.activatedRoute.snapshot.queryParams['sessionId']}&theme=light&lang=ru`);


      const isCreate = this.activatedRoute.snapshot.queryParams['type'] === 'create';

  const eventName = isCreate
    ? 'authorization_password_myid_open'
    : 'authorization_myid_identification_enter';

  const params: any = { auth_flow_id: getAuthFlowId() };

  if (isCreate) {
    params.flow_reason = this.isForgetPassword() ? 'forgot_password' : 'new_user_setup';
  }

  this.analyticsService.logFirebaseCustomEvent(eventName, params);

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
    window.removeEventListener('message', this.myIdCheck);
    window.onpopstate = null;
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

  finalNavigate() {
  if (this.activatedRoute.snapshot.queryParams['type'] === 'create') {
    this.router.navigate(['/auth/forget-password'], { queryParams: { identityToken: this.identityToken ,mode:this.mode()} })
  } else {
    this.router.navigate(['/auth/sms-check'], { queryParams: { identityToken: this.identityToken, step: 'selectBusiness',mode:AUTH_SMS_STEP.PRE_BUSINESS_SELECTION } })
  }
    this.visibleError.set('')
  }

  sendAuthCode(authCode: string) {
    this.authService.loginConfirm({
      hash: authCode,
      identity: this.activatedRoute.snapshot.queryParams['identityToken'],
    }).pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res) => {
              this.analyticsService.logFirebaseCustomEvent('authorization_myid_identification_result', {auth_flow_id:getAuthFlowId(),result:'success'});


          this.analyticsService.logFirebaseCustomEvent('authorization_success', {authorization_way: "biometrics"});
          localStorage.setItem('businessKeys', JSON.stringify(res.businessList));
            this.visible.set(true);
            this.identityToken = res.identity
            this.cf.detectChanges();
        },
        error: (res) => {
          this.analyticsService.logFirebaseCustomEvent('authorization_myid_identification_result', {auth_flow_id:getAuthFlowId(),result:'error',error_code:res.code,error_message:res.message});
          this._dialog.open(ErrorModalComponent, {
            data: {
              errorMessage: res.message
            }
          }).afterClosed().pipe(takeUntil(this.unsub$)).subscribe(() => {
            this.router.navigate(['/'])
          })
          this.cf.detectChanges();
        }
      })
  }

  sendAuthCodeCreate(authCode: string) {
    this.authService.verifyMyId({
      hash: authCode,
      identity: this.activatedRoute.snapshot.queryParams['identityToken'],
    }).pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res) => {
            this.analyticsService.logFirebaseCustomEvent('authorization_password_myid_result', {auth_flow_id:getAuthFlowId(), result:'success', flow_reason:this.isForgetPassword() ? 'forgot_password':'new_user_setup'});

          this.visible.set(true);
          this.identityToken = res.identity
          this.cf.detectChanges();
        },
        error: (res) => {
          this.analyticsService.logFirebaseCustomEvent('authorization_password_myid_result',
             {
              auth_flow_id:getAuthFlowId(),
               result:'error',
               error_code:res.code,
               error_message:res.message,
              flow_reason:this.isForgetPassword() ? 'forgot_password':'new_user_setup'}
            );
          this._dialog.open(ErrorModalComponent, {
            data: {
              errorMessage: res.message
            }
          }).afterClosed().pipe(takeUntil(this.unsub$)).subscribe(() => {
            this.router.navigate(['/'])
          })
          this.cf.detectChanges();
        }
      })
  }

  myIdCheck = (e: MessageEvent<any>) => {
    if (e.data.source != "MyIDWebSDK") return;
    switch (e.data.status) {
      case this.MyIDStatus.EXCEPTION:
        console.error(
          "MyID Iframe failed to load properly or a runtime error occurred.",
          e.data.error
        );
        break;
      case this.MyIDStatus.IN_PROGRESS:
        break;
      case this.MyIDStatus.LIVENESS_PASSED:
        const authCode = e.data?.data?.auth_code;
        if (!authCode || this.authCodeHandled()) return;
        this.authCodeHandled.set(true);

        if (this.activatedRoute.snapshot.queryParams['type'] === 'create') {
          this.sendAuthCodeCreate(authCode);
        } else {
          this.sendAuthCode(authCode);
        }
        break;
      case this.MyIDStatus.LIVENESS_FAILED:
        break;
      case this.MyIDStatus.RETRY:
        break;
      case this.MyIDStatus.EXITED:
        break;
      default:
        console.log("Unknown status:", e.data);
    }
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
  }
  sendPhoneEvent(){
    this.analyticsService?.logFirebaseCustomEvent('call_bank_button_click', null)
  }
}
