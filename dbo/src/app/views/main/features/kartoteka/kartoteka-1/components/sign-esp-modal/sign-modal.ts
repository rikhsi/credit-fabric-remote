import {Router} from "@angular/router";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {animate, style, transition, trigger} from "@angular/animations";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ChangeDetectionStrategy, Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';



import {KartotekaQrModalComponent} from "../modals/qr-modal/qr-modal";
import {EspSignConfirmComponent} from "../../../../../../../core/components/esp-sign-confirm/esp-sign-confirm.component";


@Component({
  selector: 'kartoteka-action-esp-modal',
  templateUrl: './sign-modal.html',
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



export class KartotekaESPModalComponent implements OnInit {
  safePdfUrl!: SafeResourceUrl;
  @Output() onDetail = new EventEmitter<string>();


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<KartotekaESPModalComponent>,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    public router: Router,
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data);
  }



  ngOnInit() {

  }



   qrDialog() {
    this.dialog.open(KartotekaQrModalComponent, {
      data: this.data,
      disableClose: true,
    });
    this.close();
  }


  espDialog() {
    this.dialog.open(EspSignConfirmComponent, {
      width: '560px',
      data: {...this.data, from: "kartoteka"},
    }).afterClosed()
      .subscribe({
        next: () => {
          this.close();
        }
      });
    this.close();
  }

  close() {
    this.dialogRef.close();
  }

  protected readonly Math = Math;
}
