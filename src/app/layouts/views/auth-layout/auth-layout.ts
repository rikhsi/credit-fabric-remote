import { Component, computed, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { SplashService } from '@core/services/splash.service';
import { ThemeService } from '@core/services/theme.service';
import { SelectLang, SelectTheme } from '@layouts/components';
import { AuthLayoutService } from '@layouts/services';
import { Logo } from '@shared/components';

@Component({
  selector: 'cf-auth-layout',
  imports: [RouterOutlet, SelectLang, SelectTheme, Logo],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.less',
  providers: [AuthLayoutService],
})
export class AuthLayout implements OnInit, OnDestroy {
  public currentTheme = computed(() => this.themeService.currentTheme());

  get currentLang() {
    return this.languageService.currentLang;
  }

  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService,
    private splashService: SplashService,
  ) {}

  ngOnInit(): void {
    this.splashService.hide = true;
  }

  ngOnDestroy(): void {
    this.splashService.hide = false;
  }

  public onChangeTheme(): void {
    const nextTheme = this.themeService.nextTheme();

    this.themeService.setTheme(nextTheme).subscribe();
  }

  public onChangeLang(lang: string): void {
    this.languageService.onChangeLang(lang);
  }
}
