import {ChangeDetectionStrategy, Component, Inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {ActivatedRoute, Router} from "@angular/router";
import {animate, style, transition, trigger} from "@angular/animations";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-kartoteka-modal',
  imports: [TranslateModule],
  templateUrl: './kartoteka-modal.component.html',
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

export class KartotekaModalComponent implements OnInit {
  safePdfUrl!: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<KartotekaModalComponent>,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    public router: Router,
    public route: ActivatedRoute,
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data);
  }

  canSign = signal<boolean>(false)
  loading = signal<boolean>(false)
  docNumItem = signal<string>('')

  ngOnInit() {
    this.loading.set(true);
  }

  protected formatMoney(value: number | string): { formattedInteger: any, decimal: any } {
    const num = Number(value);
    const [integer, decimal] = num.toFixed(2).split('.');
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return { formattedInteger, decimal };
  }

  redirectAction() {
    const url = this.route.snapshot.queryParamMap.get('returnUrl')
    if (url != null) {
      this.router.navigateByUrl(url)
    } else {
      this.router.navigate(["/"])
    }

  }

  close() {
    this.dialogRef.close();
  }

  protected readonly Math = Math;
}
