import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { TEST_FILE } from './models/file';
import { SplashService } from '@core/services/splash.service';
import { BridgeService } from '@core/services/bridge.service';

@Component({
  selector: 'cf-bridge-test',
  imports: [NzButtonComponent],
  templateUrl: './bridge-test.html',
  styleUrl: './bridge-test.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BridgeTest implements OnInit {
  file = TEST_FILE;

  constructor(
    private splashServie: SplashService,
    public bridgeService: BridgeService,
  ) {}

  ngOnInit(): void {
    this.splashServie.hide = true;

    this.bridgeService.initSignListener();
    this.bridgeService.getUserInfo();
  }
}
