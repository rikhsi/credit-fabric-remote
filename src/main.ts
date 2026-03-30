import { bootstrapApplication } from '@angular/platform-browser';
import { App } from '@app/app';
import { appConfig } from '@core/configs';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
