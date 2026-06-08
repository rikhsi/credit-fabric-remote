import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";
import { NgOptimizedImage } from "@angular/common";
import { NgxMaskPipe } from "ngx-mask";

@Component({
  selector: 'app-error-list',
  imports: [
    MatDialogClose,
    NgOptimizedImage,
    NgxMaskPipe
  ],
  templateUrl: './error-list.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorListComponent {
  readonly data = inject(MAT_DIALOG_DATA);
  protected readonly Math = Math;
}
