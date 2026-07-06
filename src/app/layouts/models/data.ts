import { UrlTree } from '@angular/router';

export interface LoanLayoutBackConfig {
  link: UrlTree | string | string[];
}

export interface LoanLayoutData {
  title: string;
  titleParams?: Record<string, unknown>;
  backConfig: LoanLayoutBackConfig;
}
