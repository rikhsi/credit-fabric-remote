import {ChangeDetectionStrategy, Component, inject, Inject, OnInit, signal} from '@angular/core';
import { TemplateService } from '../../../core/services/template.service';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIcon } from '@angular/material/icon';
import {Router} from "@angular/router";
import {NgxMaskPipe} from "ngx-mask";
import {animate, style, transition, trigger} from "@angular/animations";
import {NgIf} from "@angular/common";
import {TranslateModule, TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-success-modal',
  imports: [
    NgIf,
    NgxMaskPipe,
    TranslateModule
  ],
  templateUrl: './success-modal.html',
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
export class SuccessModalComponent implements OnInit {
  safePdfUrl!: SafeResourceUrl;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SuccessModalComponent>,
    private sanitizer: DomSanitizer,
    public router: Router,
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data);
  }

  fileName = signal('');

  ngOnInit() {
    console.log(100002, this.data)
    const file = localStorage.getItem('fileName');
    if (file) {
      this.fileName.set(file)
    }
  }

  getCurrentDateTime(): string {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  closeAfterSign() {
    if (window.location.pathname.includes('/payroll-project') || this.data.type === 'mass') {
      this.close()
    } else {
      // this.router.navigate(['/auth']);
      this.close()
    }

  }

  close() {
    this.dialogRef.close();
  }

  protected readonly Math = Math;
}
