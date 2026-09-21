import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHost } from '@shared/components/toast-host/toast-host';

@Component({
  selector: 'cf-root',
  imports: [RouterOutlet, ToastHost],
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../styles.less',
  template: `
    <router-outlet />
    <cf-toast-host />
  `,
})
export class App {}
