import {ChangeDetectionStrategy, Component, inject, output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from "@angular/material/dialog";

@Component({
    selector: 'app-corp-card-actions-dialog',
    imports: [
        MatDialogClose
    ],
    templateUrl: './corp-card-actions-dialog.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorpCardActionsDialogComponent {
  actions = output<void>()
  data: { img: string, title: string, desc: string } = inject(MAT_DIALOG_DATA)
}
