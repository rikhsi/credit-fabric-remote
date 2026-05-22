import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services';
import { BridgeService } from '@core/services/bridge.service';

@Component({
  selector: 'cf-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
  `,
})
export class App implements OnInit {
  constructor(
    private bridgeService: BridgeService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.user.set(this.bridgeService.getUserInfo());
    this.bridgeService.initSignListener();
  }
}
