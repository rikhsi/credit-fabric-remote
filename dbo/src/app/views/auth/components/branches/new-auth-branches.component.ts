import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef, inject,
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
import {MatDialog} from "@angular/material/dialog";
import { ActivatedRoute, Router } from '@angular/router';
import {StyxService} from "../../../../core/services/styx.service";
import { UpdateStyxComponent } from '../../../../shared/components/update-styx/update-styx.component';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import {NgxMaskDirective, provideNgxMask, NgxMaskPipe} from "ngx-mask";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SettingsService} from "../../../main/features/settings/services/settings.service";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ThemeService} from "../../../../shared/services/theme.service";
import { languages } from 'src/app/constants';
import {FirebaseAnalyticsService} from "../../../../../../firebase-analytics.service";
declare const ymaps: any;

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    NgForOf,
    TranslateModule,
    NgOptimizedImage,
    NgIf,
  ],
  providers: [provideNgxMask()],
  templateUrl: './new-auth-branches.component.html',
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


export class NewAuthBranchesComponent implements OnInit, OnDestroy {
  serialNumber = signal('')
  styxInfos = signal<Array<{company: string ,fio: string ,serialnumber: string ,thumbprint: string}>>([])
  branchesData = signal<any[]>([]);
  setBranchActive: any[] = [];
  placemarks: any[] = [];
  map: any;
  selectedLang = signal<string>("RUS")
  languages = languages
  lang = signal('ru');

  unsub$ = new Subject<void>();
  loginStep: 'login' | 'esp' | 'selectBusiness' | 'code' | 'password' | string = 'login';
  isOpen = false;
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

  alvaGroupSign = "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"

  private readonly settings = inject(SettingsService);
  readonly destroy = inject(DestroyRef);

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
    public theme: ThemeService,
    private styxService:StyxService,
    private translate:TranslateService,
    private analyticsService: FirebaseAnalyticsService
  ) {
  }

  renderPlacemarks() {
    this.placemarks = [];
    this.map.geoObjects.removeAll(); // очищаем старые метки

    this.branchesData().forEach((item: any) => {
      const isActive =
        this.setBranchActive &&
        this.setBranchActive[0] === item.latitude &&
        this.setBranchActive[1] === item.longitude;

      const placemark = new ymaps.Placemark(
        [item.latitude, item.longitude],
        {},
        {
          iconLayout: 'default#image',
          iconImageHref: isActive
            ? './assets/new-icons/hovered-logo-map.svg'
            : './assets/new-icons/logo-map.svg',
        },
      );
      placemark.events.add('click', () => {
        this.setBranchActive = ([item.latitude, item.longitude]);
        this.cf.detectChanges();
      });
      placemark.events.add('mouseenter', () => {
        placemark.options.set('iconImageHref', './assets/new-icons/hovered-logo-map.svg');
      });
      placemark.events.add('mouseleave', () => {
        const isStillActive =
          this.setBranchActive &&
          this.setBranchActive[0] === item.latitude &&
          this.setBranchActive[1] === item.longitude;
        if (!isStillActive) {
          placemark.options.set('iconImageHref', './assets/new-icons/logo-map.svg');
        }
      });

      this.map.geoObjects.add(placemark);
      this.placemarks.push({ item, placemark });
    });
  }

  setActiveBranch(coords: number[]) {
    this.setBranchActive = coords;
    this.updatePlacemarkIcons();

    if (this.map) {
      this.map.panTo(coords, { flying: true });

      const currentZoom = this.map.getZoom();
      if (currentZoom < 15) {
        this.map.setZoom(15, { duration: 500 });
      }
    }
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



  selectTypeBack() {
    this.authService.userAnotherType(this.activatedRoute.snapshot.queryParams['identityToken']).pipe(takeUntil(this.unsub$)).subscribe(() => {
      this.router.navigate(['/auth'], { queryParams: { identityToken: this.activatedRoute.snapshot.queryParams['identityToken'] } })
    })
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


  updatePlacemarkIcons() {
    this.placemarks.forEach(({ item, placemark }) => {
      const isActive =
        this.setBranchActive &&
        this.setBranchActive[0] === item.latitude &&
        this.setBranchActive[1] === item.longitude;

      placemark.options.set(
        'iconImageHref',
        isActive
          ? './assets/new-icons/hovered-logo-map.svg'
          : './assets/new-icons/logo-map.svg'
      );
    });
  }
  ngOnInit() {
    window.onpopstate = () => {
      this.router.navigate(['/auth']);
    };
    this.settings.getMaps()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((result: any) => {
        const data = result.filter((item) => item.entityType === 'BRANCH') ?? [];
        this.branchesData.set(data);
          ymaps.ready(() => {
            this.map = new ymaps.Map("yandex-map", {
              center: [41.2995, 69.2401],
              zoom: 12,
            });
              this.renderPlacemarks();
          });
      });
  }

  ngOnDestroy(): void {
    this.unsub$?.next();
    this.unsub$?.complete();
    this.socket$?.complete();
    window.onpopstate = null;
  }
  verify() {
    let {identityToken, businessId} = this.loginForm.getRawValue();
    this.utilsService.spinnerState$$.next(true);
    this.authService.verifyBussiness({identityToken, businessId})
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          if(res) {
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
          this.toastrService.error(err);
          this.utilsService.spinnerState$$.next(false);
          this.cf.markForCheck();
        }
      });
  }
  handleOtp(otp: any): void {
    this.loginForm.patchValue({code: otp});
  }
  verifyCode() {
    let {code, identityToken} = this.loginForm.getRawValue();
    this.utilsService.spinnerState$$.next(true);
    this.authService.verifySmsCode(code as any, identityToken)
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          // if(userData) {
          //   this._notificationService.requestPermission();
          //   this.userService.setUserData(userData);
          // }
          const {businessList, identityToken} = res;
          this.businessKeys = businessList;
          this.loginForm.controls.identityToken.patchValue(identityToken);
          this.loginStep = 'selectBusiness';
          this.cf.detectChanges();
        },
        error: (err) => {
          this.toastrService.error(err);
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
