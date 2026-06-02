import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { BridgeService } from '@core/services/bridge.service';
import { environment } from 'src/environments/development';

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
    this.authService.user.set(environment.skipAuth ? this.bridgeService.getUserInfo() : environment.user);
    this.bridgeService.initSignListener();
  }
}
