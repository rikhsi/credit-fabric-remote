import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { TemplateService } from '../../../core/services/template.service';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIcon } from '@angular/material/icon';
import {Router} from "@angular/router";
import {NgxMaskPipe} from "ngx-mask";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-error-modal',
  imports: [],
  templateUrl: './error-modal.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dialogAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.1)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.1)' }))
      ])
    ])
  ],
})
export class ErrorModalComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ErrorModalComponent>,
    private sanitizer: DomSanitizer,
    public router: Router,
  ) {
  }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

  protected readonly Math = Math;
}
