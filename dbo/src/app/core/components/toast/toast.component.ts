import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { Toast, ToastPackage, ToastrService } from 'ngx-toastr';

import { UiSvgIconComponent } from '../ui-svg-icon/ui-svg-icon.components';

@Component({
    selector: 'app-toast',
    imports: [CommonModule, UiSvgIconComponent, MatDividerModule],
    templateUrl: './toast.component.html',
    styles: [
        `
      :host {
        display: block;
        padding: 0 !important;
        border:none !important;
        border-radius: 16px !important;
        box-shadow: 0 16px 32px -12px #0E121B1A !important;
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('flyInOut', [
            state('inactive', style({
                display: 'none',
                opacity: 0,
            })),
            transition('inactive => active', animate('400ms ease-out', keyframes([
                style({
                    opacity: 0,
                }),
                style({
                    opacity: 1,
                }),
            ]))),
            transition('active => removed', animate('400ms ease-out', keyframes([
                style({
                    opacity: 1,
                }),
                style({
                    transform: 'translate3d(20%, 0, 0) skewX(20deg)',
                    opacity: 0,
                }),
            ]))),
        ]),
    ],
    preserveWhitespaces: false,
    standalone:true
})
export class ToastComponent extends Toast {

  // constructor is only necessary when not using AoT
  constructor(
    protected override toastrService: ToastrService,
    public override toastPackage: ToastPackage
  ) { super(toastrService, toastPackage) }

  action(event: Event) {
    event.stopPropagation();
    this.toastPackage.triggerAction();
    return false;
  }
}
