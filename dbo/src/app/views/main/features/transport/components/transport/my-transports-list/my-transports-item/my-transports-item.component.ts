import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input
} from '@angular/core';


import {NgIf, NgClass, SlicePipe, NgOptimizedImage} from '@angular/common';
import {UiSvgIconComponent} from "../../../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {MyAutoData} from "../../../../types/transport.types";
import {TransportService} from "../../../../../../../../core/services/transport.service";

@Component({
  selector: 'app-my-transports-item',
  templateUrl: './my-transports-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgClass, UiSvgIconComponent, SlicePipe, NgOptimizedImage]
})
export class MyTransportsItemComponent {
  @Input() public transport: MyAutoData | undefined;
  @Input() public selected: MyAutoData | undefined;

  public constructor(
    private _cdRef: ChangeDetectorRef,
    private _transport: TransportService
  ) {}

  public setTransport(transport: MyAutoData): void {
    transport.uuid !== this._transport.transport?.uuid &&
      (this._transport.transport = transport);
    this._cdRef.detectChanges();
  }

  // ??????????????
  public actions(): void {
  }
}
