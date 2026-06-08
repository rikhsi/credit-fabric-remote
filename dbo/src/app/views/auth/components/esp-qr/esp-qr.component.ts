import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';
import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {ISignerFuncCodes, ISignerMsgTypeCodes} from "../../constants/esp-code";
import {UtilsService} from "../../../../core/services/utils.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ToastrService} from "ngx-toastr";
import {MatOption} from "@angular/material/autocomplete";
import {MatFormField, MatSelect} from "@angular/material/select";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";

@Component({
    selector: 'app-esp-qr',
  imports: [
    MatOption,
    MatSelect,
    MatFormField,
    ReactiveFormsModule,
    NgClass,
    TranslateModule
  ],
    templateUrl: './esp-qr.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EspQrComponent implements OnInit{
  espQrForm: FormGroup = new FormGroup({
    espKey:new FormControl('',Validators.required),
  })
  private socket$!: WebSocketSubject<any>;
  #destroy = inject(DestroyRef)
  utilsService = inject(UtilsService)
  toastrService = inject(ToastrService)
  _cf  = inject(ChangeDetectorRef)
  espKeys: string[] = [];


ngOnInit() {
  setTimeout(() => {
    this.initESPWebSocket()
  }, 0);
}

  initESPWebSocket() {
    this.utilsService.spinnerState$$.next(true);
    let wsHost = 'ws://127.0.0.1:44480'
    this.socket$ = webSocket(wsHost);
    this.socket$.next({type: ISignerMsgTypeCodes.Request, func: ISignerFuncCodes.KEYLIST});

    this.socket$.pipe(takeUntilDestroyed(this.#destroy)).subscribe({
      next: ({data}) => {
        if (Array.isArray(data) && !data.length) this.toastrService.info('ЭЦП ключ не подключен. Попробуйте вставить ключ, перезагрузите страницу и повторите попытку!');
        if (Array.isArray(data)) {
          this.espKeys = data;
          this._cf.detectChanges()
          this.utilsService.spinnerState$$.next(false);
        }
      },
      error: () => {
        this.utilsService.spinnerState$$.next(false);
        this.toastrService.info('Приложение "isigner" не запущено, попробуйте запустить приложение, перезагрузите страницу и повторите попытку!');
      }
    });
  }
  formSubmit(){
  if (this.espQrForm.valid){
    this.getQr(this.espQrForm.value.espKey)
  }
  }

  getQr(espKey: string) {
    let params = {
      type: ISignerMsgTypeCodes.Request,
      func: ISignerFuncCodes.QR,
      args: {
        path: espKey,
        qrid:this.generateQrid(),
        crmid :Math.random()
      },
    }
    this.socket$.next(params)
  }
  generateQrid():number {
    return Math.floor(Math.random() * 1000000);
  }

}
