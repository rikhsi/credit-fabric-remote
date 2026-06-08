import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'cf-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
  `,
})
export class App implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.initHost();
  }
}
