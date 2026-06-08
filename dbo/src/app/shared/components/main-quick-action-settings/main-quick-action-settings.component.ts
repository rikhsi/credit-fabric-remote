import { ChangeDetectionStrategy, Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { AuthService } from '../../../views/auth/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { QuickAction } from '../../interfaces/quick-action.interface';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-main-quick-action-settings',
    imports: [
        MatDialogClose,
        MatIcon,
        MatRipple,
        FormsModule
    ],
    templateUrl: './main-quick-action-settings.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainQuickActionSettingsComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private matDialogRef: MatDialogRef<MainQuickActionSettingsComponent>,
    private toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { actions: QuickAction[], prop: string, title: string },
  ) {
  }

  ngOnInit() {
    console.log(this.data)
  }

  saveMainQuickAction() {
    this.authService.saveUserSettings({
      [this.data.prop]: this.data.actions,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.toastrService.success('Успешно!');
            this.matDialogRef.close();
          }
        }
      });
  }
}
