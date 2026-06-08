import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, takeUntil } from 'rxjs';
import { actionsList } from './my-office-item-actions.const';
import { TranslateModule } from '@ngx-translate/core';
import { NgFor, NgClass } from '@angular/common';
import { UiSvgIconComponent } from '../../../../../../../../../core/components/ui-svg-icon/ui-svg-icon.components';
import {OfficeService} from "../../../../service/office.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-my-office-item-actions',
  templateUrl: './my-office-item-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgFor, NgClass, UiSvgIconComponent, TranslateModule, UiSvgIconComponent]
})
export class MyOfficeItemActionsComponent {
  @Output() public closeActions = new EventEmitter<boolean>(false);
  @Input() public actionId: string | undefined;
  public actions = actionsList;

  public constructor(
    private _destroy$: Observable<void>,
    private _dialog: MatDialog,
    private _office: OfficeService,
    private _toastr: ToastrService,
    private _router: Router
  ) {}

  public doAction(action: string) {
    switch (action) {
      case 'delete':
        // this.deleteHome();
        break;
      case 'plus':
        this.addHomeService();
        break;
      case 'edit':
        this.editHome();
        break;
    }
  }

  private addHomeService(): void {
    this.closeActions.emit();
    this._router.navigate(['myhome/add-service']);
  }

  private editHome(): void {
    this.closeActions.emit();
    this._router.navigate(['myhome/edit-home']);
  }

  // private deleteHome(): void {
  //   this.closeActions.emit();
  //   const dialog = this._dialog.open(UiConfirmationComponent, {
  //     data: {
  //       isReverse: true,
  //       title: 'home-actions.remove-home-title',
  //       text: 'home-actions.remove-home-description'
  //     }
  //   });
  //   dialog
  //     .afterClosed()
  //     .pipe(takeUntil(this._destroy$))
  //     .subscribe((confirm) => {
  //       if (confirm) {
  //         this.removeHome();
  //       }
  //     });
  // }
  private removeHome(): void {
    if (this.actionId) {
      this._office
        .deleteOffice({ id: this.actionId })
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            if (res && res.success) {
              this._toastr.success(res.result.data.message);
              this._router.navigate(['myhome']);
            } else if (res && !res.success) {
              this._toastr.error(res.result.message);
            }
          },
          error: (err: HttpErrorResponse) => {
            this._toastr.error(err.message);
          }
        });
    }
  }
}
