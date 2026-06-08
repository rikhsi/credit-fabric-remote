import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import {FirebaseAnalyticsService} from "../../../../../../firebase-analytics.service";

@Component({
  selector: 'app-loans',
  imports: [
    RouterLinkActive,
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './loans.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoansComponent implements OnInit {

constructor(
  private analyticsService: FirebaseAnalyticsService,
) {}
  ngOnInit(): void {
    this.analyticsService.logFirebaseCustomEvent('credits_screen_jump', null);
  }
  tabs = [
    { title: 'Мои кредиты', value: 'my' },
    { title: 'Закрытые', value: 'closed' },
  ];
}
