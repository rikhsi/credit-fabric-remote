import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Inject,
  OnInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {NotificationService} from "../../../../../../core/services/notification.service";
import {NotificationContent} from "../../models/notifications.model";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {MatIcon} from "@angular/material/icon";

@Component({
    selector: 'app-notification-details',
    templateUrl: './notification-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, UiSvgIconComponent, MatIcon]
})
export class NotificationDetailsComponent implements OnInit {
  #destroy = inject(DestroyRef);
  public isLoading = true;

  public constructor(
    @Inject(MAT_DIALOG_DATA) public data: { notification: NotificationContent; unread: boolean, data: any },
    public dialogRef: MatDialogRef<NotificationDetailsComponent>,
    private _notifications: NotificationService,
    private _cdRef: ChangeDetectorRef,
    private utilsService:UtilsService
  ) {}

  public ngOnInit(): void {
    this.readNotification();
  }

  readNotification(): void {
    this._cdRef.detectChanges();
    this._notifications
      .readNotification(+this.data.notification.id || +this.data.data.id)
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((res) => {
          if (!res) return
          this.utilsService.spinnerState$$.next(false);
          this._notifications.read$$.next(true);
          this._cdRef.detectChanges();
        },
      );
  }
}
