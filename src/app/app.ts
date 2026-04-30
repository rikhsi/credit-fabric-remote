import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BridgeService } from '@core/services/bridge.service';

@Component({
  selector: 'cf-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
  `,
})
export class App implements OnInit {
  constructor(private bridgeService: BridgeService) {}

  ngOnInit(): void {
    this.bridgeService.initBridgeListeners();
    this.bridgeService.getUserInfo();
  }
}
