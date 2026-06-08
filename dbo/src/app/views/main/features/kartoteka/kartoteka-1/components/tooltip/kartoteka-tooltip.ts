// Angular
import { TranslateModule} from "@ngx-translate/core"
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogClose, MatDialogRef } from "@angular/material/dialog";



@Component({
  selector: 'tooltip-dialog',
  imports: [MatDialogClose, TranslateModule],
  templateUrl: './kartoteka-tooltip.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class Kartoteka1TooltipDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<Kartoteka1TooltipDialogComponent>,
  ) { }


  closeDialog(): void {
    this.dialogRef.close();
  }

  closeAndNavigate() {
    this.closeDialog();
  }

}


