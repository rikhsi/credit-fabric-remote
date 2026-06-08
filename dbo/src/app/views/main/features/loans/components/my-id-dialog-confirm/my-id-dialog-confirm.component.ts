import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Subject, takeUntil} from "rxjs";
import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {ToastrService} from "ngx-toastr";
import {EspSignConfirmService} from "../../../../../../core/services/esp-confirm.service";
import {ISignerFuncCodes, ISignerMsgTypeCodes} from "../../../../../auth/constants/esp-code";
import {MatOption} from "@angular/material/autocomplete";
import {MatFormField, MatSelect} from "@angular/material/select";
import {NgClass} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";


@Component({
    selector: 'app-my-id-dialog-confirm',
  imports: [
    MatIcon,
    ReactiveFormsModule,
    MatOption,
    MatSelect,
    MatFormField,
    NgClass,
    TranslateModule
  ],
    templateUrl: './my-id-dialog-confirm.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyIdDialogConfirmComponent implements OnInit, OnDestroy {
  @Output() confirm = new EventEmitter<void>()
  espKeys: string[] = [];
  unsub$ = new Subject<void>();
  private socket$!: WebSocketSubject<any>;
  signConfirmForm = this.fb.nonNullable.group({
    espKey: [null as unknown as string, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private espSignConfirmService: EspSignConfirmService,
    private cf: ChangeDetectorRef,
    public dialogRef: MatDialogRef<MyIdDialogConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { loanId: string, action: string },
  ) {
  }

  ngOnInit(): void {
    this.utilsService.spinnerState$$.next(true);
    this.initESPWebSocket();
  }

  ngOnDestroy(): void {
    this.unsub$.next();
    this.unsub$.complete();
    this.socket$.complete();
  }

  initESPWebSocket() {
    let wsHost = 'ws://127.0.0.1:44480'
    this.socket$ = webSocket(wsHost);
    this.socket$.next({type: ISignerMsgTypeCodes.Request, func: ISignerFuncCodes.KEYLIST});
    this.socket$.pipe(takeUntil(this.unsub$)).subscribe({
      next: ({data}) => {
        if (Array.isArray(data) && !data.length) this.toastrService.info('ЭЦП ключ не подключен. Попробуйте вставить ключ и повторите попытку!');
        if (Array.isArray(data) && data.length) this.espKeys = data;
        this.utilsService.spinnerState$$.next(false);
        if (!data.sign) return;
        this.utilsService.spinnerState$$.next(true);
        this.espSignConfirmService.loanRequestConfirm({
          sign: data.sign,
          digest: btoa(JSON.stringify(this.data)),
        }).pipe(takeUntil(this.unsub$)).subscribe(res => {
          if (!res) return
          this.toastrService.success(res.msg);
          this.confirm.emit()
          this.dialogRef.close();
          this.cf.detectChanges()


        })

      },
      error: () => {
        this.utilsService.spinnerState$$.next(false);
        this.toastrService.info('Приложение "isigner" не запущено, попробуйте запустить приложение и повторите попытку!');
      }
    });
  }

  onSubmit() {
    const {espKey} = this.signConfirmForm.value;
    let params = {
      type: ISignerMsgTypeCodes.Request,
      func: ISignerFuncCodes.SIGNP7,
      args: {
        data: btoa(JSON.stringify(this.data)),
        snum: espKey,
        stok: "IhWGSft/o/tarrSU0MkMha+XRwQJAephFCFLzWKoevSxv0ei/a+kV+KFx32C3OkzaTf0vQ==",
        attached: true,
      },
    }
    this.socket$.next(params);
  }
}
