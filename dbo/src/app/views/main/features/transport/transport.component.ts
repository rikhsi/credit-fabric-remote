import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {UiSvgIconComponent} from "../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {ToastrService} from "ngx-toastr";
import {TransportService} from "../../../../core/services/transport.service";
import {MyTransportsListComponent} from "./components/transport/my-transports-list/my-transports-list.component";
import {MyTransportInfoComponent} from "./components/transport/my-transport-info/my-transport-info.component";


@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    UiSvgIconComponent,
    MyTransportsListComponent,
    MyTransportInfoComponent,
    TranslateModule
  ]
})
export class TransportComponent {
  private _sub: Subscription | undefined;
  public route = '';

  public constructor(
    private _router: Router,
    private _toastr: ToastrService,
    private _transport: TransportService,
    private _translate: TranslateService
  ) {
    const route = this._router.url.split('/').slice(1)[0];
    this.route = 'left-menu.' + route.split('?')[0];
  }

  public refreshTransportList(): void {
    this.unsubscribe();
    this._sub = this._transport
      .refreshTransportList()
      .pipe()
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            const { success } = this._translate.instant('status');
            this._transport.refreshTransport.next(true);
            this._toastr.success(success);
          } else if (res && !res.success) {
            this._toastr.error(res.result.message);
          }
        },
        error: (err: HttpErrorResponse) => {
          this._toastr.error(err.message);
        }
      });
  }

  private unsubscribe(): void {
    if (this._sub) {
      this._sub.unsubscribe();
      this._sub = undefined;
    }
  }
}
