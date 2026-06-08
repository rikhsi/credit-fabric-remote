import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {Observable, Subject, takeUntil} from 'rxjs';
import { TransportFormComponent } from '../../transport-form/transport-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgFor, UpperCasePipe } from '@angular/common';
import {UiSvgIconComponent} from "../../../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {daysInName} from "../../../../types/transport.types";

@Component({
  selector: 'app-my-transport-info-nav-items',
  templateUrl: './my-transport-info-nav-items.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgFor, UiSvgIconComponent, UpperCasePipe, TranslateModule]
})
export class MyTransportInfoNavItemsComponent {
  @Input() public isLoading = false;
  @Input() public oil = {} as {
    day: number;
    km: string;
    date: string;
  };
  @Input() public uuid = '';
  @Input() public plate = '';
  @Output() public refetch = new EventEmitter<void>();
  private _destroy$ = new Subject<void>()
  public constructor(

    private _dialog: MatDialog,
    private _router: Router
  ) {}

  public getInsurance(): void {
    this._router.navigate(['state'], {
      queryParams: {
        plate: this.plate,
        uuid: this.uuid
      }
    });
  }

  public openOilDetails(): void {
    const dialog = this._dialog.open(TransportFormComponent, {
      panelClass: 'card-dialog-rounded-2-5',
      data: {
        title: 'oil',
        type: this.oil.day === -1 ? 'add' : 'edit',
        uuid: this.uuid
      }
    });

    dialog
      .afterClosed()
      .pipe(takeUntil(this._destroy$))
      .subscribe((refetch) => {
        if (refetch) this.refetch.emit();
      });
  }

  public formatDate(days: number): string {
    const lang = localStorage.getItem('lang') || 'Ru';
    return daysInName(lang, days);
  }
}
