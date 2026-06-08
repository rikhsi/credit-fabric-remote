import { NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRipple } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { AgreeDialogComponent } from 'src/app/core/components/agree-dialog/agree-dialog.component';
import { UiButtonAddComponent } from 'src/app/core/components/ui-button-add/ui-button-add.component';
import { UiSvgIconComponent } from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import { ScrollableDirective } from 'src/app/core/utils/scrollable.directive';

import { OfficeService } from '../../service/office.service';
import { MyOfficeItem } from '../../types/my-office.type';
import { AddOfficeComponent } from '../add-office/add-office.component';
import { MyOfficeItemComponent } from './my-home-item/my-office-item.component';

@Component({
    selector: 'app-my-office-list',
    templateUrl: './my-office-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    styles: [`
    .mat-mdc-tab-body-wrapper {
      max-width: calc(100vw - 410px);
    }
  `],
    imports: [
        ScrollableDirective,
        NgIf,
        NgFor,
        UiButtonAddComponent,
        RouterLink,
        MyOfficeItemComponent,
        UiSvgIconComponent,
        TranslateModule,
        MatIcon,
        MatCheckbox,
        MatRipple
    ]
})
export class MyOfficeListComponent implements OnInit, OnDestroy {
  public isLoading = true;
  public offices: MyOfficeItem[] | undefined;
  public office: MyOfficeItem | undefined;
  private _destroy$ = new Subject<void>()


  public constructor(
    private _cdRef: ChangeDetectorRef,
    private _toastr: ToastrService,
    private _office: OfficeService,
    private _dialog: MatDialog
  ) {
  }

  public ngOnInit() {
    this.getOfficeList();
    this._office.office$
      .pipe(takeUntil(this._destroy$))
      .subscribe((office) => {
        if (office) {
          this.office = office;
          this._cdRef.detectChanges();
        }
      });
    this._office.reFetchOffice$
      .pipe(takeUntil(this._destroy$))
      .subscribe((refetch) => {
        if (refetch) {
        this.getOfficeList()
        }
      });
  }
  private getOfficeList() {
    this._office.reFetchOffice$.next(false);
    this.isLoading = true;
    this._office
      .getOfficeList()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            const data = res.result.data.myHomes;
            this.offices = data;
            this._office.office = data[0];
            if (data.length === 0) {
            }
          } else if (res && !res.success) {
            this._toastr.error(res.result.message);
          }
          this.isLoading = false;
          this._cdRef.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this._toastr.error(err.message);
          this._cdRef.detectChanges();
        }
      });
  }

  addOffice() {
    const dialog = this._dialog.open(AddOfficeComponent, {data: {type: 'create', uuid: null}, width: '744px'})
    dialog.afterClosed().pipe(takeUntil(this._destroy$)).subscribe((res) => {
      if (res === 'success') this.getOfficeList()
    })
  }

  doAction(event: any, uuid: string, name: string) {
    if (event === 'edit' && uuid) {
      const dialog = this._dialog.open(AddOfficeComponent, {
        data: {type: 'edit', uuid: uuid, name: name},
        width: '744px'
      })
      dialog.afterClosed().pipe(takeUntil(this._destroy$)).subscribe((res) => {
        if (res === 'success') this.getOfficeList()
      })
    } else if (event === 'delete' && uuid) {
      const dialog = this._dialog.open(AgreeDialogComponent, {
        data: {title:'Вы точно хотите удалить'},
      })
      dialog.afterClosed().pipe(takeUntil(this._destroy$)).subscribe((res) => {
        if (res === 'success') this.deleteOffice(uuid)
      })
    }
  }
  deleteOffice(id:string){
    this._office.deleteOffice({id}).pipe(takeUntil(this._destroy$)).subscribe({
      next:(res)=>{
        if (res.success){
          this._toastr.success(res.result.data.message? res.result.data.message : res.result.message)
        }
        else {
          this._toastr.error(res.result.message)
        }
      },
      complete:()=>{
        this.getOfficeList()
      }
    })
  }
  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
