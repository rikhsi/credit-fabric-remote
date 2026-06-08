import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import {MatPaginator} from "@angular/material/paginator";
import {NgxMaskPipe} from "ngx-mask";
import {MatIcon} from "@angular/material/icon";
import {MatRipple} from "@angular/material/core";
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatTooltip} from "@angular/material/tooltip";
import { UiSvgIconComponent } from '../../../../../../core/components/ui-svg-icon/ui-svg-icon.components';
import { ApplicationsService } from '../../../applications/services/applications.service';
import {getRussianFormattedDate, getStatusApplication, getStepsApplication} from "../../../../../../core/utils/mixin.utils";
import { SwiftItem } from '../../models/swift.model';
import { Subject, takeUntil } from 'rxjs';
import { EspSignConfirmComponent } from '../../../../../../core/components/esp-sign-confirm/esp-sign-confirm.component';
import { EspSignConfirmService } from '../../../../../../core/services/esp-confirm.service';
import { MatDialog } from '@angular/material/dialog';
import {
  EspSignApplicationComponent
} from '../../../../../../core/components/esp-sign-application/esp-sign-application.component';
import { MatFormField } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-operations',
    imports: [
        MatMenu,
        MatPaginator,
        NgxMaskPipe,
        UiSvgIconComponent,
        MatIcon,
        MatRipple,
        RouterLink,
        NgClass,
        MatTooltip,
        NgIf,
        MatFormField,
        MatSelectModule,
        NgOptimizedImage,
        MatInput,
        MatMenuTrigger,
        MatButton,
    ],
    providers: [DatePipe],
    templateUrl: './swift.component.html',
    styleUrls: ['./swift.component.scss'],
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwiftComponent implements OnInit {
  #destroy = inject(DestroyRef)
  isFetching = false
  private _cf = inject(ChangeDetectorRef)
  private _applicationService = inject(ApplicationsService)
  accountApplications: SwiftItem[] = [];

  private espSignService = inject(EspSignConfirmService);

  constructor(
    private _matDialog: MatDialog,
    ) {
  }

  ngOnInit(): void {
    this.getApplicationsList();
  }

  getApplicationsList() {
    this.isFetching = true
    this._applicationService.getApplications({
      pageSize: 20,
      pageNum: 0,
      sender: null,
      receiver: null,
      dateFrom: null,
      dateTo: null,
      amountFrom: null,
      amountTo: null,
      docNum: null,
      currency: null,
      searchText: '',
      applicationTypes: ['SWIFT'],
    })
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((res) => {
      if (!res) return;
      // this.accountApplications = res.data
      this.isFetching = false
      this._cf.detectChanges()
    })
  }

  getSliceDescription(description: string | undefined): string {

    if (description!.length >= 200) {
      const result = description!.slice(0, 200)
      return result + '...'
    } else {
      return description ? description : '-'
    }
  }

  sign(id: string | number) {
    this._matDialog.open(EspSignApplicationComponent, {
      width: '744px',
      data: { applicationId: id },
    });
  }

  protected readonly getRussianFormattedDate = getRussianFormattedDate;
  protected readonly getStatusApplication = getStatusApplication;
  protected readonly getStepsApplication = getStepsApplication;
}
