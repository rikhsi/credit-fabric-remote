import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { AuthLoginService } from './auth-login.service';
import { InputDefault, InputPassword, LabelControl } from '@shared/components';
import { AuthApiService } from '@api/controllers/base';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'cf-auth-login',
  imports: [NzTypographyComponent, TranslocoDirective, FormField, NzButtonComponent, InputDefault, InputPassword, LabelControl],
  templateUrl: './auth-login.html',
  styleUrl: './auth-login.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AuthLoginService],
})
export class AuthLogin {
  get authForm() {
    return this.alService.authForm;
  }

  constructor(
    private alService: AuthLoginService,
    private authApi: AuthApiService,
    private authService: AuthService,
  ) {}

  @HostListener('keydown.enter')
  onSubmit(): void {
    if (this.authForm().valid()) {
      this.alService.authFormDisabled.set(true);

      this.authApi.signIn$(this.authForm().value()).subscribe({
        next: (result) => {
          this.authService.login(result);
          this.alService.authFormDisabled.set(false);
        },
        error: () => {
          this.alService.authFormDisabled.set(false);
        },
      });
    } else {
      this.authForm.username().markAsDirty();
      this.authForm.password().markAsDirty();
    }
  }
}
