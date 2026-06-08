import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { TemplateService } from '../../../core/services/template.service';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIcon } from '@angular/material/icon';
import {Router} from "@angular/router";
import {NgxMaskPipe} from "ngx-mask";

@Component({
  selector: 'app-template-success-modal',
  imports: [
    MatIcon,
    MatDialogClose,
    NgxMaskPipe
  ],
  templateUrl: './template-success-modal.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateSuccessModalComponent implements OnInit {
  safePdfUrl!: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TemplateSuccessModalComponent>,
    private sanitizer: DomSanitizer,
    public router: Router,
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data);
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

  protected readonly Math = Math;
}
