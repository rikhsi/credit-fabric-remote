import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIcon } from '@angular/material/icon';
import {Router} from "@angular/router";
import {NgxMaskPipe} from "ngx-mask";
import {animate, style, transition, trigger} from "@angular/animations";
import {NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-success-modal',
  imports: [
    NgIf,
    NgxMaskPipe,
    TranslateModule
  ],
  templateUrl: './settings-success-modal.html',
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
export class SettingsSuccessModal implements OnInit {
  safePdfUrl!: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SettingsSuccessModal>,
    private sanitizer: DomSanitizer,
    public router: Router,
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data);
  }

  ngOnInit() {
  }

  closeAfterSign() {
    if (this.data?.type === 'user-process') {
      this.close()
    }

  }

  close() {
    this.dialogRef.close();
  }

  protected readonly Math = Math;
}
