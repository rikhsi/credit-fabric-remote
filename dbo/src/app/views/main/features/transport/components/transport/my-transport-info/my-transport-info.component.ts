import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {Observable, Subject, takeUntil} from 'rxjs';


import { TransportFormComponent } from '../transport-form/transport-form.component';
import { TransportDriverLicenseComponent } from './transport-driver-license/transport-driver-license.component';
import { MyTransportInfoItemsComponent } from './my-transport-info-items/my-transport-info-items.component';
import { MyTransportInfoNavItemsComponent } from './my-transport-info-nav-items/my-transport-info-nav-items.component';
import { NgIf, NgFor } from '@angular/common';
import {MyAutoData, TransportInfoData, TransportTabItem} from "../../../types/transport.types";
import {TransportService} from "../../../../../../../core/services/transport.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-my-transport-info',
  templateUrl: './my-transport-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MyTransportInfoNavItemsComponent,
    NgFor,
    MyTransportInfoItemsComponent,
    TransportDriverLicenseComponent
  ]
})
export class MyTransportInfoComponent implements OnInit {
  public transport: MyAutoData | undefined;
  public isLoading = true;
  public transportInfo: TransportInfoData | undefined;
  public tabItems: TransportTabItem[] = [
    {
      id: 1,
      img: './assets/icons/transports/transports-nav.svg#peoples',
      title: 'affidavit',
      date: '',
      day: -1
    },
    {
      id: 2,
      img: './assets/icons/transports/transports-nav.svg#gas',
      title: 'gas',
      date: '',
      day: -1
    },
    {
      id: 3,
      img: './assets/icons/transports/transports-nav.svg#shield',
      title: 'insurance',
      date: '',
      day: -1
    },
    {
      id: 4,
      img: './assets/icons/transports/transports-nav.svg#files',
      title: 'tinting',
      date: '',
      day: -1
    }
  ];
  private _destroy$ = new Subject<void>()
  public constructor(

    private _transport: TransportService,
    private _toastr: ToastrService,
    private _cdRef: ChangeDetectorRef,
    private _dialog: MatDialog
  ) {}

  public ngOnInit(): void {
    this.watchTransport();
  }

  private watchTransport(): void {
    this._transport.transport$
      .pipe(takeUntil(this._destroy$))
      .subscribe((transport) => {
        if (transport) {
          this.transport = transport;
          this.getInfoMyAuto();
        }
      });
  }

  public getInfoMyAuto(): void {
    this._transport.refetchTransport.next(false);
    this.isLoading = true;
    this._cdRef.detectChanges();
    if (this.transport) {
      this._transport
        .getMyAutoInfo({ uuid: this.transport.uuid })
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            if (res && res.success) {
              this.transportInfo = res.result.data;
              this.tabItems.forEach((item) => {
                for (const key in this.transportInfo) {
                  if (key.indexOf(item.title) !== -1) {
                    const dateKey =
                      `${item.title}Date` as keyof TransportInfoData;
                    const dayKey =
                      `${item.title}Day` as keyof TransportInfoData;
                    item.date = String(this.transportInfo[dateKey]);
                    item.day = Number(this.transportInfo[dayKey]);
                  }
                }
              });
            } else if (res && !res.success) {
              this._toastr.error(res.result.message);
            }
            this.stopLoading();
          },
          error: (err: HttpErrorResponse) => {
            this._toastr.error(err.message);
            this.stopLoading();
          }
        });
    }
  }

  public handleClick(data: { title: string; isEdit: boolean }): void {
    switch (data.title) {
      case 'affidavit':
        this.openForm('affidavit', data.isEdit);
        break;
      case 'gas':
        this.openForm('gas', data.isEdit);
        break;
      case 'tinting':
        this.openForm('tinting', data.isEdit);
        break;
    }
  }

  private openForm(title: string, isEdit: boolean): void {
    if (this.transport) {
      const dialog = this._dialog.open(TransportFormComponent, {
        panelClass: 'card-dialog-rounded-2-5',
        data: {
          title,
          type: isEdit ? 'edit' : 'add',
          uuid: this.transport.uuid
        }
      });
      dialog
        .afterClosed()
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (refetch) => {
            if (refetch) this.getInfoMyAuto();
          }
        });
    }
  }

  private stopLoading(): void {
    this.isLoading = false;
    this._cdRef.detectChanges();
  }
}
