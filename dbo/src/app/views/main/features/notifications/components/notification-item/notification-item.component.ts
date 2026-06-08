import {ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, Input, Output} from '@angular/core';
import {MatRipple} from "@angular/material/core";
import {NgClass, SlicePipe} from "@angular/common";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {NotificationContent} from "../../models/notifications.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatDialog} from "@angular/material/dialog";
import {NotificationDetailsComponent} from "../notification-details/notification-details.component";
import { NotificationService } from '../../../../../../core/services/notification.service';

@Component({
    selector: 'app-notification-item',
    imports: [
        MatRipple,
        NgClass,
        UiSvgIconComponent,
        SlicePipe
    ],
    templateUrl: './notification-item.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationItemComponent {
  @Input() public notification = {} as NotificationContent;
  #destroy = inject(DestroyRef);
  _dialog = inject(MatDialog);

  public openNotification(notification:NotificationContent): void {
    const dialog = this._dialog.open(NotificationDetailsComponent, {
      data: {
       notification:notification,
        unread: this.notification.status === 'UNREAD'
      },
      width:'375px',
      minHeight:'400px'
    });
  }
}
