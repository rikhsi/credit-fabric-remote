import {Component, inject, Inject, OnInit, signal, TemplateRef} from "@angular/core";
import {Router} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {QRCodeComponent} from "angularx-qrcode";
import {MatIcon} from "@angular/material/icon";
import {UiOtpInputComponent} from "../../../../../../../core/components/ui-otp-input/ui-otp-input.component";
import {DatePipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {DeviceInfo, TariffDto} from "../../../models/settings.model";
import {take} from "rxjs";
import {NewSettingsService} from "../../../services/new-settings.service";
import {ToastrService} from "ngx-toastr";
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {UserService} from "../../../../../../../core/services/user.service";
import {NgxMaskPipe} from "ngx-mask";


@Component({
  selector: "app-signing-dialog",
  templateUrl: "./tariffs-dialog.component.html",
  styleUrls: [],
  standalone: true,
  imports: [
    MatIcon,
    MatDialogClose,
    MatDivider,
    QRCodeComponent,
    UiOtpInputComponent,
    NgOptimizedImage,
    NgForOf,
    NgIf,
    TranslateModule,
    NgxMaskPipe
  ],
  providers: [DatePipe]
})

export class TariffsDialogComponent implements OnInit {
  public datePipe = inject(DatePipe)

  constructor(
    public router: Router,
    @Inject(MAT_DIALOG_DATA) public data: {
      tariffs: TariffDto[]
    },
    private translateService: TranslateService,
    private dialog: MatDialog,
    private newSettingsService: NewSettingsService,
    private toastrService: ToastrService,
    public userService: UserService,
  ) {}
ngOnInit() {
  console.log(1000001, this.data.tariffs);
}

  handleOtp(otp: any): void {
    console.log(555, otp)
  }

   formatRussianDate(input: string): string {
    const [datePart, timePart] = input.split(" ");
    const [day, month, year] = datePart.split(".");
    const [hours, minutes] = timePart.split(":");

    const date = new Date(+year, +month - 1, +day, +hours, +minutes);

    const weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date);
    const dayStr = day.padStart(2, '0');
    const monthStr = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date);
    const yearStr = year;
    const timeStr = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

    return `${weekday}, ${dayStr} ${monthStr} ${yearStr}, ${timeStr}`;
  }
  closeDialog(){
    this.dialog?.closeAll();
  }
  integerPart(balance): string {
    if (!balance) return "";
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    if (!balance) return "";
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }
  protected readonly Number = Number;
}
