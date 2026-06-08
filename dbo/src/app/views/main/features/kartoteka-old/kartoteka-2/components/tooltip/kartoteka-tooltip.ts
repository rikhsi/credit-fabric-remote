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


export class Kartoteka2TooltipDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<Kartoteka2TooltipDialogComponent>,
  ) { }


  closeDialog(): void {
    this.dialogRef.close();
  }

  closeAndNavigate() {
    this.closeDialog();
    window.open('https://lex.uz/uz/docs/1979969#1980957', '_blank');
  }


}


