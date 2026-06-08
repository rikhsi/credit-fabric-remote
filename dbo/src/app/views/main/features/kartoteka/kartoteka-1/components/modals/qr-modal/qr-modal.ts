import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
  inject, Inject, OnDestroy, OnInit, Output, signal
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { QRCodeComponent } from 'angularx-qrcode';
import { ActivatedRoute, Router } from "@angular/router";
import { animate, style, transition, trigger } from "@angular/animations";


import { UtilsService } from "../../../../../../../../core/services/utils.service";
import { KartotekaSuccessModalComponent } from "../success-modal/success-modal";


import { KartotekaESPModalComponent } from "../../sign-esp-modal/sign-modal";


import { KartotekaService } from "../../../../services/kartoteka.service";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-kartoteka-qr-modal',
  imports: [
    QRCodeComponent,
  ],
  templateUrl: './qr-modal.html',
  styleUrls: ['./qr-modal.scss'],
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
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class KartotekaQrModalComponent implements OnInit, OnDestroy {
  @Output() onDetail = new EventEmitter<string>();
  safePdfUrl!: SafeResourceUrl;
  qrLink: string = '';
  timer = 60;
  intervalId!: NodeJS.Timer;
  intervalRef: any;
  isCompleted = signal(false);
  tempId = signal('');
  private toast=  inject(ToastrService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<KartotekaQrModalComponent>,
    private sanitizer: DomSanitizer,
    private utilsService: UtilsService,
    private dialog: MatDialog,
    public router: Router,
    public route: ActivatedRoute,
    private cf: ChangeDetectorRef,
    private kartotekaService: KartotekaService,

  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data);
  }

  ngOnInit() {
    this.intervalRef = setInterval(() => {
      this.check(false)
    }, 2000)

    this.getQrCode();
    this.startCounter();
  }

  ngOnDestroy() {
    clearInterval(this.intervalRef);
  }

  closeAction() {
    this.router.navigate(['/kartoteka-1']);
    this.close();
  }

  startCounter(): void {
    if (this.timer === 0) {
      this.stopCounter();
      return;
    }
    this.intervalId = setInterval(() => {
      if (this.timer === 0) {
        this.stopCounter();
        this.close();
        this.dialog.open(KartotekaESPModalComponent, {
          data: this.data,
          disableClose: true,
        });
      } else {
        this.timer--
      }

      this.cf.detectChanges();
    }, 1000);
  }

  stopCounter(): void {
    this.intervalId && clearInterval(this.intervalId as any);
  }

  openPaymentSignModal() {
    this.dialog.open(KartotekaESPModalComponent, {
      data: this.data,
      disableClose: true,
    });
    this.close();
  }

  close() {
    this.dialogRef.close();
    this.stopCounter()
  }

  getQrCode() {
    const payload = {
      type: this.data.type,
      body: {
        cardId: this.data.body.cardId,
        acceptedSum: this.data.body.acceptedSum,
        rejectedSum: this.data.body.rejectedSum,
        rejectedDocNum: Number(this.data.body.rejectedDocNum),
        rejectedDocDate: this.data.body.rejectedDocDate,
        reason: this.data.body.reason
      }
    }

    this.kartotekaService.getCardKartotekaTemporaryQr(this.data.type == 'MOVE_TO_KARTOTEKA_2' ? this.data : payload).pipe()
      .subscribe((res: any) => {
        this.qrLink = res.qrLink
        this.tempId.set(res.qrLink.split('/').at(-1))
        this.cf.detectChanges();
      })
  }



  check(loading: boolean = true) {
    if (loading) {
      this.utilsService.spinnerState$$.next(true);
    }

    this.kartotekaService.getCardKartotekaTemporaryQrChecker(this.tempId()).pipe()
      .subscribe({
        next: (res: any) => {
          if (this.isCompleted()) {
            return clearInterval(this.intervalRef);
          }
          if (res?.status === "SUCCESS") {
            this.isCompleted.set(true);
            clearInterval(this.intervalRef);
            this.cf.detectChanges();
            this.close();
            this.dialog.open(KartotekaSuccessModalComponent, {
              data: {
                title: this.data.type == "ACCEPT"
                  ? "Принято"
                  : this.data.type == "REJECT"
                    ? "Отклонено"
                    : this.data.type == "MOVE_TO_KARTOTEKA_2"
                      ? "Отправлено в Картотеку-2"
                      : "Оплачено",
                  docNum: this.data.docNum
              },
              disableClose: true,
            }).afterClosed().subscribe(() => {
            })
            this.utilsService.spinnerState$$.next(false);
          } else if (res?.status === "FAILED") {
            this.toast.error("Что-то пошло не так!");
            this.dialog.closeAll()
          }
        },
        error: () => {
          this.utilsService.spinnerState$$.next(false);
        }
      })
  }

  protected readonly Math = Math;
}
