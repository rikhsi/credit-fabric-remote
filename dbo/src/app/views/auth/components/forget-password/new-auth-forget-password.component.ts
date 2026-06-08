import { getAuthFlowId } from 'src/app/core/utils';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {ToastrService} from 'ngx-toastr';
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {UserService} from 'src/app/core/services/user.service';
import {UtilsService} from 'src/app/core/services/utils.service';

import {AuthService} from '../../services/auth.service';
import {NotificationService} from "../../../../core/services/notification.service";
import {AgreeDialogComponent} from "../../../../core/components/agree-dialog/agree-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import { ActivatedRoute, Router } from '@angular/router';
import {StyxService} from "../../../../core/services/styx.service";
import { AUTH_SMS_STEP, languages } from 'src/app/constants';

import {
  trigger,
  transition,
  style,
  animate, state,
} from '@angular/animations';
import {NgxMaskDirective, provideNgxMask, NgxMaskPipe} from "ngx-mask";
import {UiOtpInputComponent} from "../../../../core/components/ui-otp-input/ui-otp-input.component";
import {filter} from "rxjs/operators";
import {NgClass, NgForOf, NgIf, NgOptimizedImage, NgSwitch, NgSwitchCase} from "@angular/common";
import {ErrorModalComponent} from "../../../../shared/components/error-modal/error-modal";
import {SuccessModalComponent} from "../../../../shared/components/success-modal/success-modal";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ThemeService} from "../../../../shared/services/theme.service";
import {RsaOaepService} from "../../../../shared/services/rsa-oaep.service";
import {FirebaseAnalyticsService} from "../../../../../../firebase-analytics.service";

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    NgIf,
    NgForOf,
    NgClass,
    TranslateModule,
    NgSwitch,
    NgOptimizedImage,
  ],
  providers: [provideNgxMask()],
  templateUrl: './new-auth-forget-password.component.html',
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
    trigger('expandCollapse', [
      state('void', style({ opacity: 0, height: 0, transform: 'translateY(-10px)' })),
      state('visible', style({ opacity: 1, height: '*', transform: 'translateY(5px)' })),
      transition('void => visible', animate('200ms ease-out')),
      transition('visible => void', animate('150ms ease-in')),
    ]),

  ]
})
export class NewAuthForgetPasswordComponent implements OnInit, OnDestroy {
  serialNumber = signal('')
  confirmShowPassword = signal(false);
  showPassword = signal(false);
  styxInfos = signal<Array<{company: string ,fio: string ,serialnumber: string ,thumbprint: string}>>([])
  selectedLang = signal<string>("RUS")
  publicKey = signal<string>("")
  languages = languages
  lang = signal('ru');
  unsub$ = new Subject<void>();
  loginStep: 'login' | 'esp' | 'selectBusiness' | 'code' | 'password' | string = 'login';
  focusLogin = false;
  focusPassword = false;
  isOpen = false;
  phone = '';
  password = '';
  passwordMismatch = false;
  passwordStrength = 0;
  businessKeys: { businessId: number, businessName: string }[] = [];
    isForgetPassword = signal<boolean>(false)
  mode = signal<string>('')
  private socket$!: WebSocketSubject<any>;

  loginForm = this.fb.nonNullable.group(
    {
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordsValidator }
  );


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cf: ChangeDetectorRef,
    private userService: UserService,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private _notificationService: NotificationService,
    private _dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    protected router: Router,
    private styxService:StyxService,
    public theme: ThemeService,
    private translate:TranslateService,
    private rsaService: RsaOaepService,
    private analyticsService: FirebaseAnalyticsService,
  ) {
  }

  passwordsValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!password || !confirmPassword) return null;

    return password === confirmPassword
      ? null
      : { confirmPassword: 'Пароли не совпадают' };
  }

  ngOnInit() {
    window.onpopstate = () => {
      this.router.navigate(['/auth']);
    };
    let modeValue = this.activatedRoute.snapshot.queryParams['mode'] 
    this.mode.set(modeValue)
    this.isForgetPassword.set(modeValue=== AUTH_SMS_STEP.FORGET_PASSWORD)

      console.log('new auth forget password')
    const publicKeyStore = localStorage.getItem('publicKey');
    if (publicKeyStore) {
     this.publicKey.set(publicKeyStore);
    }
    this.checkFromRegistration();
    this.loginForm.valueChanges.subscribe(values => {
      const value = this.newPasswordCtrl.value || '';
      const filtered = value.replace(/[а-яА-ЯёЁ]/g, '');
      this.newPasswordCtrl.setValue(filtered, { emitEvent: false });
      if (this.loginForm?.errors?.['confirmPassword']) {
        this.passwordMismatch = true;
        this.cf.detectChanges();
      } else {
        this.passwordMismatch = false;
        this.cf.detectChanges();
      }
    });
  }

  backToSelectType() {
    this.authService.userAnotherType(this.activatedRoute.snapshot.queryParams['identityToken']).pipe(takeUntil(this.unsub$)).subscribe(() => {
      this.router.navigate(['/auth'], { queryParams: { identityToken: this.activatedRoute.snapshot.queryParams['identityToken'] } })
    })
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

  showPass() {
    this.showPassword.update(v => !v)
  }

  showConfirmPass() {
    this.confirmShowPassword.update(v => !v)
  }

  get strengthLevel(): number {
    const value = this.loginForm.get('password')?.value || '';
    return this.calculateStrength(value);
  }

  private calculateStrength(password: string): number {
    let score = 0;

    if (password.length >= 12) score++;
    const digits = (password.match(/\d/g) || []).length;
    if (digits >= 1) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    return Math.min(score, 5);
  }
  get newPasswordCtrl(): AbstractControl { return this.loginForm.get('password')!; }


  getStrengthLevel() {
    const value = this.newPasswordCtrl.value || '';
    let score = 0;
    if (/[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score++;
    if (value.length >= 12) score++;
    return score;
  }

  hasUpperCase(): boolean {
    const value = this.newPasswordCtrl.value || '';
    return /[A-Z]/.test(value);
  }

  hasNumber(): boolean {
    const value = this.newPasswordCtrl.value || '';
    return /\d/.test(value);
  }

  hasSpecialChar(): boolean {
    const value = this.newPasswordCtrl.value || '';
    return /[!@#$%^&*(),.?":{}|<>]/.test(value);
  }

  hasMinLength(): boolean {
    const value = this.newPasswordCtrl.value || '';
    return value.length >= 12;
  }

  getBarColor(index: number): string {
    const level = this.strengthLevel;
    if (index >= level) return 'bg-[#E0E0E0]';
    if (index <= 1) return 'bg-[#FB3748]';
    if (index === 2) return 'bg-[#F6B51E]';
    return 'bg-[#00A38D]';
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
    window.onpopstate = null;
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


  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  setPassword() {
    let {password, confirmPassword} = this.loginForm.getRawValue();
    const valuesToEncrypt = {
      password: password,
      confirmPassword: confirmPassword
    };
    if (this.publicKey()) {
      this.utilsService.spinnerState$$.next(true);
      this.rsaService.encryptValues(
        valuesToEncrypt,
        this.publicKey()
      ).then((encrypted: any) =>
        this.authService.setPassword({ encPassword: encrypted.password, encConfirmPassword: encrypted.confirmPassword , identity: this.activatedRoute.snapshot.queryParams['identityToken']})
          .pipe(takeUntil(this.unsub$))
          .subscribe({
            next: () => {
              this.analyticsService?.logFirebaseCustomEvent('authorization_password_create_result', 
              {
                 auth_flow_id: getAuthFlowId(),
    flow_reason: this.isForgetPassword() ? 'forgot_password' : 'new_user_setup',
    result:'success'
              });
              this._dialog.open(SuccessModalComponent, {
                data: {
                  type: 'password'
                }
              })
              this.cf.detectChanges();
              localStorage.removeItem('publicKey');
            },
            error: (err) => {
                    this.analyticsService?.logFirebaseCustomEvent('authorization_password_create_result', 
              {
                 auth_flow_id: getAuthFlowId(),
    flow_reason: this.isForgetPassword() ? 'forgot_password' : 'new_user_setup',
    result:'error'
              });


              this._dialog.open(ErrorModalComponent, {
                data: {
                  errorMessage: err
                }
              })
              this.utilsService.spinnerState$$.next(false);
              this.cf.markForCheck();
            }
          })
      )
    }
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
    if(this.loginForm.invalid) return;
    if (this.passwordMismatch) return;
    this.analyticsService?.logFirebaseCustomEvent('authorization_password_create', {
    auth_flow_id: getAuthFlowId(),
    flow_reason: this.isForgetPassword() ? 'forgot_password' : 'new_user_setup'
  });
    this.setPassword();
  }
  sendPhoneEvent(){
    this.analyticsService?.logFirebaseCustomEvent('call_bank_button_click', null)
  }
}
