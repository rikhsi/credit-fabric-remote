import { UrlTree } from '@angular/router';

export interface LoanLayoutBackConfig {
  link: UrlTree | string | string[];
}

export interface LoanLayoutData {
  title: string;
  backConfig: LoanLayoutBackConfig;
}
