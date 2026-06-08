import {ChangeDetectionStrategy, Component, EventEmitter, inject, Inject, Input, OnInit, Output} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";
import {NgForOf, NgIf} from "@angular/common";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDivider} from "@angular/material/divider";
import {NgxMaskPipe} from "ngx-mask";
import {SvgIconComponent} from "../../../../../../../../../shared/components/svg-icon/svg-icon.component";
import {MatIcon} from "@angular/material/icon";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-details-office-modal',
  imports: [
    NgIf,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MatDivider,
    NgxMaskPipe,
    SvgIconComponent,
    MatIcon,
    NgForOf
  ],
  templateUrl: './details-office-modal.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dialogAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ],
})
export class DetailsOfficeModalComponent implements OnInit {
  public data: any = inject(MAT_DIALOG_DATA)
  public _matDialogRef = inject(MatDialogRef<DetailsOfficeModalComponent>)


  private translateService =  inject(TranslateService)

  formatDocDate(createdAt: any): string {
    const day = String(createdAt.getDate()).padStart(2, '0');
    const month = String(createdAt.getMonth() + 1).padStart(2, '0');
    const year = createdAt.getFullYear();

    const translateMonths = [
      'new.january',
      'new.february',
      'new.march',
      'new.april',
      'new.may',
      'new.june',
      'new.july',
      'new.august',
      'new.september',
      'new.october',
      'new.november',
      'new.december'
    ];

    const monthKey = translateMonths[parseInt(month, 10) - 1];
    const monthName = this.translateService.instant(monthKey);

    return `${parseInt(day, 10)} ${monthName} ${year}`;
  }

  ngOnInit() {
    console.log(this.data, "data")
  }
 close() {
   this._matDialogRef.close();
 }

  protected readonly Math = Math;
  protected readonly Number = Number;
}
