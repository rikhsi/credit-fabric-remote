import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { NgIf } from '@angular/common';
import {UiSvgIconComponent} from "../../../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {daysInName, DriverLicense} from "../../../../types/transport.types";

@Component({
    selector: 'app-transport-driver-license',
    templateUrl: './transport-driver-license.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        // UiCircleProgressComponent,
        UiSvgIconComponent,
        TranslateModule
    ]
})
export class TransportDriverLicenseComponent implements OnChanges {
  @Input() public isLoading = true;
  @Input() public lisence = {} as DriverLicense;

  private _percent = 0;
  public isAnimating = false;

  public get licenseDate(): string {
    const lang = localStorage.getItem('lang') || 'Ru';
    return daysInName(lang, this.lisence.dayLeft);
  }

  public get progress(): number {
    return 238 - this._percent;
  }
  public get percentage(): number {
    return this.lisence.dayLeft;
  }

  public constructor(private _cdRef: ChangeDetectorRef) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['lisence'] && changes['lisence'].currentValue) {
      this.animateCircle();
    }
  }

  private animateCircle(): void {
    this.isAnimating = true;
    this._cdRef.detectChanges();
    if (this.lisence) {
      setTimeout(() => {
        this._percent = this.lisence.dayLeft * 0.0652054795;
        this.isAnimating = false;
        this._cdRef.detectChanges();
      }, 300);
    }
  }
}
