import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { AccreditItem } from '../../models/letter-of-credit.model';
import { DecimalPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-letters-details',
    imports: [
        DecimalPipe,
        MatIcon,
        NgOptimizedImage,
        NgClass,
        MatTooltip
    ],
    templateUrl: './letters-details.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LettersDetailsComponent {
  constructor(
    private matDialogRef: MatDialogRef<LettersDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { accredit: AccreditItem },
  ) {
  }

  closeDialog() {
    this.matDialogRef.close();
  }

}
