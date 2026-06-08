import {Component, OnInit, signal, TemplateRef, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {MatDialogClose, MatDialogContent} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {QRCodeComponent} from "angularx-qrcode";
import {MatIcon} from "@angular/material/icon";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {Subscription, take} from "rxjs";
import {NewSettingsService} from "../../services/new-settings.service";
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators, FormGroup} from "@angular/forms";
import {MatError, MatFormField, MatInputModule} from "@angular/material/input";
import {NgxMaskDirective} from "ngx-mask";
import {NotificationCategoryDto, NotificationSilenceDto} from "../../models/settings.model";
import {ToastrService} from "ngx-toastr";
import {MatSlideToggle} from "@angular/material/slide-toggle";


@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.component.html",
  styleUrls: ["./notifications.component.scss"],
  imports: [
    MatDialogContent,
    MatIcon,
    MatDialogClose,
    MatDivider,
    QRCodeComponent,
    NgIf,
    TranslateModule,
    NgForOf,
    MatFormField,
    MatError,
    ReactiveFormsModule,
    MatInputModule,
    NgxMaskDirective,
    NgClass,
    MatSlideToggle
  ]
})

export class MyNotificationsComponent implements OnInit {
  constructor(
    public router: Router,
    private dialog: MatDialog,
    private newSettingsService: NewSettingsService,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private translateService: TranslateService,

  ) {}
  @ViewChild('dialogHour') dialogHour!: TemplateRef<any>;
  @ViewChild('dialogTemplateNotify') dialogTemplateNotify!: TemplateRef<any>;
  private subscription!: Subscription;
  data= {}
  settingsNotificationList = signal<NotificationCategoryDto[]>([]);
  settingsNotificationSilenceInfo = signal<NotificationSilenceDto>({});
  clearSettingsNotificationList = signal<NotificationCategoryDto[]>([]);
  editStatus = signal<boolean>(false)
  editSilece = signal<boolean>(false)
  notificationsEnabled = signal<boolean>(true)
  dialogRef!: MatDialogRef<any>;
  form: FormGroup = this.fb.group(
    {
      from: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      to: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    },
  );



ngOnInit() {
  this.subscription = this.newSettingsService.refresh$.subscribe(trigger => {
    this.loadMyNotifySettings()
    this.loadMyNotifySilenceSettings()
  });

  // this.form.valueChanges.subscribe(() => {
  //   this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });
  //   console.log(1000, this.form.value);
  // });
}
  loadMyNotifySettings() {
    // console.log("loadMyNotifySettings")
    this.newSettingsService.getUserNotificationSettingsList().pipe(take(1)).subscribe({
      next: (res: any) => {
        console.log(5555, res)
        if (res?.success) {
          this.notificationsEnabled.set(!res?.result?.data?.isActive)
          this.settingsNotificationList.set(res?.result?.data?.categoryList || null);
          this.clearSettingsNotificationList.set(JSON.parse(JSON.stringify(this.settingsNotificationList() || [])));
        } else {
          this.notificationsEnabled.set(!res?.result?.data?.isActive)
          this.settingsNotificationList.set([]);
          this.clearSettingsNotificationList.set([]);
        }

      },
      error: (err) => {
        this.settingsNotificationList.set([]);
        this.clearSettingsNotificationList.set([]);
      }
    })

  }
  loadMyNotifySilenceSettings() {
    // console.log("loadMyNotifySettings")
    this.newSettingsService.getUserNotificationSilenceSettingsItem().pipe(take(1)).subscribe({
      next: (res: any) => {
        console.log(23232, res.result.data)
        if (res?.success) {
          this.settingsNotificationSilenceInfo.set(res?.result?.data || {})

        } else {
          const mg = res.result?.message || '';
          this.toastrService.error(mg || "Произошла ошибка.");
        }

      },
      error: (err) => {
        const mg = err.result?.message || '';
        this.toastrService.error(mg || "Произошла ошибка.");
      }
    })

  }
  deleteNotfyData(){
    console.log(11233123)
    this.newSettingsService.deletetUserNotificationSettings().pipe(take(1)).subscribe({
      next: (res: any) => {
        console.log(5555, res)
        if (res?.success) {
          this.newSettingsService.triggerRefresh()
          const msg = this.translateService.instant(`settings.success`) || ''
          this.dialog.closeAll()
          this.toastrService.success(msg.toString());
        } else {
          const mg = res.result?.message || '';
          this.toastrService.error(mg || "Произошла ошибка.");

        }
      }
    }
    )

  }
  openDialog(template: TemplateRef<any>): void {
    this.dialogRef = this.dialog.open(template, {
      panelClass: 'settings-notifications-dialog',
      width: '480px',
    });
  }
  deleteNotfy(template: TemplateRef<any>): void {
    this.dialogRef = this.dialog.open(template, {
      panelClass: 'settings-notifications-dialog',
      width: '480px',
    });
  }
  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
  closeAllDialog () {
    this.dialog.closeAll();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log(23322332)
      return;
    }

    const from  = this.form?.value?.from;
    const  to = this.form?.value?.to;

    const data = {
      from: this.formatTime(from),
      to: this.formatTime(to),
    };
     if ((this.settingsNotificationSilenceInfo()?.from && this.settingsNotificationSilenceInfo()?.to)) {
       this.newSettingsService.editUserNotificationSilenceSettings(data).pipe(take(1)).subscribe({
         next: (res: any) => {
           console.log(5555, res)
           if (res?.success) {
             // this.editSilece.set(false);
             this.loadMyNotifySilenceSettings()
             const msg = this.translateService.instant(`settings.success`) || ''
             this.toastrService.success(msg.toString());
             this.cancelFormDiealod()
           } else {
             const mg = res.result?.message || '';
             this.toastrService.error(mg || "Произошла ошибка.");

           }
         },
         error: (err) => {
           const mg = err.result?.message || '';
           this.toastrService.error(mg || "Произошла ошибка.");
         }
       })

     } else {
       this.newSettingsService.setUserNotificationSilenceSettingsList(data).pipe(take(1)).subscribe({
         next: (res: any) => {
           console.log(5555, res)
           if (res?.success) {
             this.loadMyNotifySilenceSettings()
             const msg = this.translateService.instant(`settings.success`) || ''
             this.toastrService.success(msg.toString());
             this.cancelFormDiealod()
           } else {
             const mg = res.result?.message || '';
             this.toastrService.error(mg || "Произошла ошибка.");

           }
         },
         error: (err) => {
           const mg = err.result?.message || '';
           this.toastrService.error(mg || "Произошла ошибка.");
         }
       })

     }

    console.log('Quiet hours enabled:', from, to);
  }

   formatTime(value: string): string {
    if (!value || value.length !== 4) return value;

    const h = value.slice(0, 2);
    const m = value.slice(2, 4);

    return `${h}:${m}`;
  }

  cancelProcess(): void {
    this.settingsNotificationList.set(JSON.parse(JSON.stringify(this.clearSettingsNotificationList() || [])));
    console.log(111111, this.settingsNotificationList())
   this.editStatus.set(false);
  }

  editNotify() {
    this.newSettingsService.updateUserNotificationSettings({categoryList: this.settingsNotificationList()}).pipe(take(1)).subscribe({
      next: (res: any) => {
        console.log(5555, res)
        if (res?.success) {

          this.newSettingsService.triggerRefresh()
          const msg = this.translateService.instant(`settings.success`) || ''
          this.toastrService.success(msg.toString());
          this.editStatus.set(false)
          this.dialog.closeAll()
          } else {
          const mg = res.result?.message || '';
          this.toastrService.error(mg || "Произошла ошибка.");

        }

      },
      error: (err) => {
        const mg = err.result?.message || '';
        this.toastrService.error(mg || "Произошла ошибка.");

      }
    })

}
  isChannelEnabled(item: any, channel: string): boolean {
    return item.channelSettings?.some(
      (cs: any) => cs.notifyChannel === channel && cs.enabled
    );
  }
  isChannelEnabledStatus(item: any, channel: string): boolean {
    return item.channelSettings?.some(
      (cs: any) => cs.notifyChannel === channel && cs.mandatory
    );
}
  onChannelChange(item: any, channel: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    const channelSetting = item.channelSettings.find(
      (cs: any) => cs.notifyChannel === channel
    );

    if (channelSetting) {
      channelSetting.enabled = checked;
    }
  }
  deleteSilece(){
    this.newSettingsService.editUserNotificationSilenceSettings({status: 'DELETED'}).pipe(take(1)).subscribe({
      next: (res: any) => {
        console.log(5555, res)
        if (res?.success) {
          const msg = this.translateService.instant(`settings.success`) || ''
          this.toastrService.success(msg.toString());
          this.dialog.closeAll()
          this.loadMyNotifySilenceSettings()
        } else {
          const mg = res.result?.message || '';
          this.toastrService.error(mg || "Произошла ошибка.");

        }

      },
      error: (err) => {
        const mg = err.result?.message || '';
        this.toastrService.error(mg || "Произошла ошибка.");

      }
    })
  }
  cancelFormDiealod(){
    this.form.reset();
   this.dialog.closeAll()
  }
  editSileceInfo(){
    // this.editSilece.set(true)

    this.dialogRef = this.dialog.open(this.dialogHour, {
      panelClass: 'settings-notifications-dialog',
      width: '480px',
    });
    this.form.setValue({
      from: this.settingsNotificationSilenceInfo()?.from?.replace(':', '') || '',
      to: this.settingsNotificationSilenceInfo()?.to?.replace(':', '') || '',
    });
  }

  onToggle(event) {
    this.dialogRef = this.dialog.open(this.dialogTemplateNotify, {
      panelClass: 'settings-notifications-dialog',
      width: '480px',
    });
  }

  showNotifyEditDialog(template: TemplateRef<any>): void {
    this.dialogRef = this.dialog.open(template, {
      panelClass: 'settings-notifications-dialog',
      width: '480px',
    });
  }
  setDefaultNotify(){
    this.newSettingsService.setDefaultNotificationSettings({}).pipe(take(1)).subscribe({
      next: (res: any) => {
        console.log(11122223333, res)
        if (res?.success) {
          const msg = this.translateService.instant(`settings.success`) || ''
          this.toastrService.success(msg.toString());
          this.dialog.closeAll()
          this.newSettingsService.triggerRefresh()
        }

      },
      error: (err) => {}
    })

  }
}

