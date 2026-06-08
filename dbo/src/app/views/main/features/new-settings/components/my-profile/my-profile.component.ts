import {
  Component, ElementRef, OnDestroy,
  OnInit,
  signal, ViewChild
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {AuthService} from "../../../../../auth/services/auth.service";
import {Subscription, take} from "rxjs";
import {UserInfoDto} from "../../../../../../core/models/user.model";
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import {SigningDialogComponent} from "../settings-dialogs/signing-dialog/signing-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {NewSettingsService} from "../../services/new-settings.service";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-my-profile',
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    NgStyle,
    SigningDialogComponent,
    NgForOf,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    TranslateModule
  ],
  providers: [
    provideNgxMask()
  ],
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.scss'],
    styles: '',
})
export class MyProfileComponent implements OnInit, OnDestroy {
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLInputElement>;
  private subscription!: Subscription;

  userInfoItems = signal<UserInfoDto | null>(null);
  emailChangeShow = signal<boolean>(false);
  phoneChangeShow = signal<boolean>(false);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  phoneControl = new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]);
  constructor(
    private authService: AuthService,
    private matDialog: MatDialog,
    private newSettingsService: NewSettingsService,

  ) {}

  ngOnInit() {
    this.subscription = this.newSettingsService.refresh$.subscribe(trigger => {
        this.loadMyProfile()
        this.emailChangeShow.set(false);
        this.phoneChangeShow.set(false);
    });

  }

  loadMyProfile() {
    this.authService.getUserInfo()
      .pipe(take(1))
      .subscribe(res => {
        this.userInfoItems.set(res || null);
      });
  }

  emailChange() {
    this.clearEmail()
    this.phoneChangeShow.set(false)
    this.emailChangeShow.set(true)
    setTimeout(() => this.emailInput.nativeElement.focus(), 0);

  }

  phoneChange() {
    this.clearPhone()
    this.emailChangeShow.set(false)
    this.phoneChangeShow.set(true)
    setTimeout(() => this.phoneInput.nativeElement.focus(), 0);
  }

  get isInvalid(): boolean {
    return this.emailControl.invalid && (this.emailControl.dirty || this.emailControl.touched);
  }

  get isInvalidPhone(): boolean {
    return this.phoneControl.invalid && (this.phoneControl.dirty || this.phoneControl.touched);
  }


  clearEmail(): void {
    this.emailControl.reset('');
  }
  clearPhone(): void {
    this.phoneControl.reset('');
  }
  onReset(): void {
    this.emailControl.reset('');
    this.emailChangeShow.set(false);
  }
  onResetPhone(): void {
    this.phoneControl.reset('');
    this.phoneChangeShow.set(false);
  }

  onSave(): void {
    if (this.emailControl.valid) {
      // console.log(`Email: ${this.emailControl.value}`);
      // this.emailChangeShow.set(false);
      this.openSigningDialog('email')
    } else {
      this.emailControl.markAsTouched();
    }
  }
  onSavePhone(): void {
    if (this.phoneControl.valid) {
      this.openSigningDialog('phone')
    } else {
      this.phoneControl.markAsTouched();
    }
  }

  openSigningDialog(type = ''){
    console.log(4444, this.phoneControl.value)
    this.matDialog.closeAll()
    this.matDialog.open(SigningDialogComponent, {
      data: {email: this.emailControl.value, type, newPhoneNumber: this.phoneControl.value, currentEmail: this?.userInfoItems()?.userInfo?.email || ""},
      width: '540px',
    })
  }
  allowOnlyNumbers(event: KeyboardEvent): void {
    const isNumber = /^[0-9]$/.test(event.key);
    if (!isNumber) event.preventDefault();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get userRoles(): any[] {
    const roleData = this.userInfoItems()?.user?.role;
    if (Array.isArray(roleData)) {
      return roleData;
    } else if (typeof roleData === 'string') {
      return [{ displayName: roleData }];
    }
    return [];
  }
  get formattedPhone(): string {
    const raw = this.userInfoItems()?.userInfo?.phoneNumber || "";
    if (!raw) return raw;
    const digits = raw.replace(/\D/g, '');

    return digits.replace(
      /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
      '$1 $2 $3 $4 $5'
    );
  }
  preventSpace(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }
  onPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (pastedText.includes(' ')) {
      event.preventDefault();
    }
  }
  downloadPdf() {
    this.newSettingsService
      .downloadPolicy({ documentType: 'PRIVACY_POLICY' })
      .pipe(take(1))
      .subscribe((res: any) => {

        const blob = res.body || res; // observe bo‘lsa res.body

        const fileName =
          res.headers?.get('content-disposition')?.split('filename=')[1] ||
          'policy.pdf';

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();

        window.URL.revokeObjectURL(url);
      });
  }
}
