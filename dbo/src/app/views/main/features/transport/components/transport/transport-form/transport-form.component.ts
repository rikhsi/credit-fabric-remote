import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { TransportInfoFormComponent } from './transport-info-form/transport-info-form.component';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import {UiSvgIconComponent} from "../../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";

@Component({
    selector: 'app-transport-form',
    templateUrl: './transport-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        UiSvgIconComponent,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        TransportInfoFormComponent,
        TranslateModule
    ]
})
export class TransportFormComponent {
  public constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      type: 'add' | 'edit';
      uuid: string;
    },
    public dialogRef: MatDialogRef<TransportFormComponent>
  ) {}
}
