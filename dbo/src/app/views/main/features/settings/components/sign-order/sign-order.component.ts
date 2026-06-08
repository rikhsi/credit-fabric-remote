import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";

import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {MatDialog} from "@angular/material/dialog";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SignOrderResponse} from "../../models/settings.model";
import {SettingsService} from "../../services/settings.service";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {MatRipple} from "@angular/material/core";
import {AddSignOrderComponent} from "../add-sign-order/add-sign-order.component";
import { KeyValuePipe, NgForOf } from '@angular/common';
import {MatChip} from "@angular/material/chips";
import {AgreeDialogComponent} from "../../../../../../core/components/agree-dialog/agree-dialog.component";
import {ToastrService} from "ngx-toastr";
import {EditSignOrderComponent} from "../edit-sign-order/edit-sign-order.component";
import { RouterLink } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { UpdateStyxComponent } from '../../../../../../shared/components/update-styx/update-styx.component';

@Component({
    selector: 'app-sign-order',
    imports: [
        MatIcon,
        MatMenu,
        UiSvgIconComponent,
        MatMenuTrigger,
        MatRipple,
        NgForOf,
        MatChip,
        RouterLink,
        KeyValuePipe,
        MatIconButton,
        MatTooltip
    ],
    templateUrl: './sign-order.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignOrderComponent implements OnInit {
  private _matDialog = inject(MatDialog)
  #destroy = inject(DestroyRef)
  private _settingsService = inject(SettingsService)
  private _cf = inject(ChangeDetectorRef)
  private _utilsService = inject(UtilsService)
  private _toast = inject(ToastrService)
  orderList: SignOrderResponse[] = []


  deleteOrder(id: number) {
    if (id) {
      const dialog = this._matDialog.open(AgreeDialogComponent, {
        data: {title: 'Вы точно хотите удалить'},
      })
      dialog.afterClosed().pipe(takeUntilDestroyed(this.#destroy)).subscribe((res) => {
        if (res === 'success') this.delete(id)
      })
    }

  }

  delete(id: number) {
    this._utilsService.spinnerState$$.next(true)
    this._settingsService.deleteSignOrder(id).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res) => {
      if (!res) return
      this._toast.success(res.msg)
      this.getOrderList()
    })
  }

  getRoles(order: any): any[] {
    return Object.values(order || {}) as any;
  }

  getOrderList() {
    this.orderList = [];
    this._settingsService.getOrders()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((res) => {
      if (!res) return
      this.orderList = res;
      this._cf.detectChanges();
    })
  }

  addSignOrder() {
    const dialogRef = this._matDialog.open(AddSignOrderComponent, {
      width: '600px'
    })
    dialogRef.componentInstance.add.subscribe(() => {
      dialogRef.close()
      this.getOrderList()
    });
  }

  openStyxUpdate() {
    const dialogRef = this._matDialog.open(UpdateStyxComponent, {
      width: '600px',
    });
  }

  editSignOrder(id: number) {
    this._settingsService.getOneSignOrder(id).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res) => {
      if (res) {
        const dialogRef = this._matDialog.open(EditSignOrderComponent, {
          width: '600px',
          data: res
        })
        dialogRef.componentInstance.edit.subscribe(() => {
          dialogRef.close()
          this.getOrderList()
        })
      }
    })
  }

  ngOnInit(): void {
    this.getOrderList()
  }

  protected readonly Object = Object;
}
