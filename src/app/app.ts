import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'cf-root',
  imports: [RouterOutlet],
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../styles.less',
  template: `
    <router-outlet />
  `,
})
export class App {}
