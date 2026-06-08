import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from "@angular/material/dialog";
import {PayrollProjectResponseGroupContent} from "../../models/payroll-project.type";
import {RouterLink} from "@angular/router";
import { IconComponent } from '../../../../../../shared/ui/icon/icon.component';

@Component({
  selector: 'app-choose-card-type',
  imports: [
    MatDialogClose,
    RouterLink,
    IconComponent
  ],
  templateUrl: './choose-card-type.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseCardTypeComponent {
  readonly data: {content: PayrollProjectResponseGroupContent[], hasKartoteka: boolean} = inject(MAT_DIALOG_DATA)
}
