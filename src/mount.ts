import { ApplicationRef, createComponent } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { Router } from '@angular/router';
import { App } from '@app/app';
import { appConfig } from '@app/core/configs/app.config';

let appRef: ApplicationRef | null = null;

export default async function mount(container: HTMLElement, basePath = '/credit-fabric') {
  appRef = await createApplication({
    ...appConfig,
    providers: [...appConfig.providers, { provide: APP_BASE_HREF, useValue: basePath }],
  });

  const compRef = createComponent(App, {
    environmentInjector: appRef.injector,
    hostElement: container,
  });

  appRef.attachView(compRef.hostView);

  const router = appRef.injector.get(Router);
  await router.navigate(['/loan']);
}

export function unmount() {
  document.getElementById('credit-fabric-light')?.remove();
  appRef?.destroy();
  appRef = null;
}
