import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import { UtilsService } from 'src/app/core/services/utils.service';

import { OfficeService } from '../../service/office.service';
import { MyOfficeItem, MyOfficeService } from '../../types/my-office.type';
import { AddServiceComponent } from '../add-service/add-service.component';
import {NgxMaskPipe} from "ngx-mask";

@Component({
    selector: 'app-my-office-services',
    imports: [
        MatIcon,
        UiSvgIconComponent,
        MatMenuModule,
        MatButtonModule,
        NgxMaskPipe
    ],
    templateUrl: './my-office-services.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyOfficeServicesComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>()
  office: MyOfficeItem | undefined
  services: MyOfficeService[] = []
  isLoading: boolean = false

  constructor(
    private _office: OfficeService,
    private _dialog: MatDialog,
    private _cdRef: ChangeDetectorRef,
    private router: Router,
    private utilsService: UtilsService
  ) {
  }

  ngOnInit() {
    this.watchTransport()
  }

  private watchTransport(): void {
    this._office.office$


      .pipe(takeUntil(this._destroy$))
      .subscribe((office) => {
        if (office) {
          this.office = office
          this.isLoading = true
          this.getDetailOffice()
          this.isLoading = false
        }
      })
  }

  getDetailOffice() {
    this._office.getDetailMyOffice({id: this.office?.uuid}).pipe(takeUntil(this._destroy$)).subscribe(
      {
        next: (res) => {
          if (res.success) {
            this.services = res.result.data.services
          }
        },
        complete: () => {
          this._cdRef.markForCheck()
        }
      }
    )
  }

  addService() {
    this.utilsService.spinnerState$$.next(true);
    this._office.getCategories().pipe().subscribe({
      next: (res) => {
        if (res.success) {
          this.utilsService.spinnerState$$.next(false);
          this._dialog.open(AddServiceComponent, {
            data: {
              categories: res.result.data.categories,
              office: this.office
            }
          }).afterClosed().pipe(takeUntil(this._destroy$)).subscribe(() => ({}))
        }
      }
    })
  }

  onClickPayment(service: any) {
    this.utilsService.spinnerState$$.next(true);
    this.router.navigate(['../my-office/payments'], { state: service })
  }

  ngOnDestroy() {
    this._destroy$.next()
    this._destroy$.complete()
  }
}
