import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter, Input,
  OnDestroy,
  OnInit, Output,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { UserService } from 'src/app/core/services/user.service';
import { UtilsService } from 'src/app/core/services/utils.service';

import { AuthService } from '../../services/auth.service';
import { NotificationService } from "../../../../core/services/notification.service";
import { AgreeDialogComponent } from "../../../../core/components/agree-dialog/agree-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from '@angular/router';
import { StyxService } from "../../../../core/services/styx.service";
import { UpdateStyxComponent } from '../../../../shared/components/update-styx/update-styx.component';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { NgxMaskDirective, provideNgxMask, NgxMaskPipe } from "ngx-mask";
import { UiOtpInputComponent } from "../../../../core/components/ui-otp-input/ui-otp-input.component";
import { filter } from "rxjs/operators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgClass, NgForOf } from "@angular/common";
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import {ErrorModalComponent} from "../../../../shared/components/error-modal/error-modal";
import {TranslateModule} from "@ngx-translate/core";
import {ThemeService} from "../../../../shared/services/theme.service";

@Component({
  selector: 'app-auth-business',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    NgForOf,
    SvgIconComponent,
    TranslateModule
  ],
  providers: [provideNgxMask()],
  templateUrl: './new-auth-business.component.html',
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
export class NewAuthBusinessComponent implements OnInit, OnDestroy {
  serialNumber = signal('')
  styxInfos = signal<Array<{ company: string, fio: string, serialnumber: string, thumbprint: string }>>([])

  unsub$ = new Subject<void>();
  timer = 59;
  intervalId!: NodeJS.Timer;
  isOpen = false;
  phone = '';
  @Output() public submitSelection = new EventEmitter<number>();
  @Input() public data: any = [];
  businessKeys: { businessId: number, businessName: string }[] = [];
  private socket$!: WebSocketSubject<any>;
  loginForm = this.fb.nonNullable.group({
    code: ['', Validators.minLength(6)],
  });
  isAuthenticated = signal<boolean>(false)



  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cf: ChangeDetectorRef,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    private toastrService: ToastrService,
    private userService: UserService,
    private _notificationService: NotificationService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    public theme: ThemeService,
  ) {
  }

  ngOnInit() {
    const token = (this.userService.getToken() || '').trim();
    this.isAuthenticated.set(token.length > 0);
    window.onpopstate = () => {
      this.router.navigate(['/auth']);
    };
    if (!this.data) {
      const businessKeys = localStorage.getItem('businessKeys') as string;
      this.data = JSON.parse(businessKeys)
      this.cf.detectChanges();
    }
    this.startCounter();
    this.checkFromRegistration();
    this.loginForm.get('code')?.valueChanges
      .pipe(
    )
      .subscribe(value => {
        if (value.length === 6) {
          this.verifyCode();
        }
      });
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
    const identityToken = this.activatedRoute.snapshot.queryParams['identityToken']
    this.utilsService.spinnerState$$.next(true);
    this.authService.verifyBussiness({ identityToken, businessId })
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
          this.dialog.open(ErrorModalComponent, {
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
          if (val['successfullyRegistered'] === '1') {
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
    window.onpopstate = null;
    this.socket$?.complete();
  }

  handleOtp(otp: any): void {
    this.loginForm.patchValue({ code: otp });
  }
  verifyCode() {
    let { code } = this.loginForm.getRawValue();
    this.utilsService.spinnerState$$.next(true);
    this.authService.verifySmsCode(code as any, this.activatedRoute.snapshot.queryParams['identityToken'])
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          console.log(res, "res")
          // const {businessList} = res;
          // this.businessKeys = businessList;
          // this.loginStep = 'selectBusiness';
          // this.cf.detectChanges();
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



  submit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;
    this.verifyCode();
  }
}
