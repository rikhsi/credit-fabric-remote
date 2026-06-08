import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { ReactiveFormsModule } from "@angular/forms";
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { NgClass } from '@angular/common';
import { ICONS_TYPE } from 'src/app/shared/types';
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-agree-dialog',
  imports: [
    MatIcon,
    MatProgressSpinner,
    ReactiveFormsModule,
    SvgIconComponent,
    NgClass,
    TranslateModule
  ],
  templateUrl: './agree-dialog.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgreeDialogComponent {
  @Output() onAgree = new EventEmitter<string>();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, text: string, isMatIcon?: boolean, icon?: ICONS_TYPE, iconColor: string },
    public _dialogRef: MatDialogRef<AgreeDialogComponent>
  ) {
  }

}
