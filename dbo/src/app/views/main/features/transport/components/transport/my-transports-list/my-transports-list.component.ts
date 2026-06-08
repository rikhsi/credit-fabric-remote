import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil} from 'rxjs';

import { TransportFormComponent } from '../transport-form/transport-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { MyTransportsItemComponent } from './my-transports-item/my-transports-item.component';
import { NgIf, NgFor } from '@angular/common';
import {UiSvgIconComponent} from "../../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {MyAutoData} from "../../../types/transport.types";
import {ToastrService} from "ngx-toastr";
import {TransportService} from "../../../../../../../core/services/transport.service";
import {ScrollableDirective} from "../../../../../../../core/utils/scrollable.directive";
import {UiButtonAddComponent} from "../../../../../../../core/components/ui-button-add/ui-button-add.component";


@Component({
  selector: 'app-my-transports-list',
  templateUrl: './my-transports-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ScrollableDirective,
    UiButtonAddComponent,
    NgIf,
    NgFor,
    MyTransportsItemComponent,
    UiSvgIconComponent,
    TranslateModule
  ]
})
export class MyTransportsListComponent implements OnInit {
  public isLoading = true;
  public transports: MyAutoData[] = [];
  public transport: MyAutoData | undefined;
  private _destroy$ = new Subject<void>()
  public constructor(

    private _cdRef: ChangeDetectorRef,
    private _toastr: ToastrService,
    private _dialog: MatDialog,
    private _transport: TransportService
  ) {}

  public ngOnInit(): void {
    this.getMyAutoList();
    this.listenCarChange();
    this.watchRefetch();
    this.watchRefresh();
  }

  public addTransport(): void {
    if (this.transport) {
      const dialog = this._dialog.open(TransportFormComponent, {
        panelClass: 'card-dialog-rounded-2-5',
        data: {
          title: 'transport',
          type: 'add',
          uuid: this.transport.uuid
        }
      });
      dialog
        .afterClosed()
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            if (res) this.getMyAutoList();
          }
        });
    }
  }

  private getMyAutoList(): void {
    this._transport.refetchTransport.next(false);
    this.isLoading = true;
    this._transport.transport = null;
    this.transports = [];
    this._transport.addAuto().pipe(takeUntil(this._destroy$)).subscribe({
      next:(res)=>{
        if (res && res.success){
          this._transport
            .getMyAutoAll()
            .pipe(takeUntil(this._destroy$))
            .subscribe({
              next: (res) => {
                if (res && res.success) {
                  this.transports = res.result.data.myAutoList;
                  const data = res.result.data.myAutoList[0];
                  data && (this._transport.transport = data);
                } else if (res && !res.success) {
                  this._toastr.error(res.result.message);
                }
                this.isLoading = false;
                this._cdRef.detectChanges();
              },
              error: (err: HttpErrorResponse) => {
                this._toastr.error(err.message);
                this.isLoading = false;
                this._cdRef.detectChanges();
              }
            });
        }
      }
    })


  }
  private listenCarChange(): void {
    this._transport.transport$
      .pipe(takeUntil(this._destroy$))
      .subscribe((transport) => {
        if (transport) {
          this.transport = transport;
          this._cdRef.detectChanges();
        }
      });
  }
  // Triggers after Edit/Add/Delete
  private watchRefetch(): void {
    this._transport.refetchTransport
      .pipe(takeUntil(this._destroy$))
      .subscribe((isRefetch) => {
        if (isRefetch) {
          this.getMyAutoList();
        }
      });
  }
  // Manual Refresh List from DB
  private watchRefresh(): void {
    this._transport.refreshTransport
      .pipe(takeUntil(this._destroy$))
      .subscribe((isRefresh) => {
        if (isRefresh) {
          this.getMyAutoList();
        }
      });
  }
}
