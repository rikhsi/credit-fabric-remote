

import {NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {animate, style, transition, trigger} from "@angular/animations";
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';





@Component({
  selector: 'app-success-modal',
  imports: [
    NgIf,
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


export class KartotekaSuccessModalComponent {
 
  public data: any = inject(MAT_DIALOG_DATA)
  constructor(
    private dialogRef: MatDialogRef<KartotekaSuccessModalComponent>,
    public router: Router,
  ) {}

  
  
  close() {
    this.dialogRef.close();
  }

  protected readonly Math = Math;
}
