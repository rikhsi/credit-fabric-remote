import { ApplicationRef, createComponent } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { Router } from '@angular/router';
import { App } from '@app/app';
import { appConfig } from '@app/core/configs/app.config';

let appRef: ApplicationRef | null = null;

export default async function mount(container: HTMLElement, basePath = '/credit-fabric') {
  const fullPath = window.location.pathname;
  const baseIndex = fullPath.indexOf(basePath);
  const resolvedBase = baseIndex !== -1 ? fullPath.slice(0, baseIndex + basePath.length) : basePath;

  appRef = await createApplication({
    ...appConfig,
    providers: [...appConfig.providers, { provide: APP_BASE_HREF, useValue: resolvedBase }],
  });

  const compRef = createComponent(App, {
    environmentInjector: appRef.injector,
    hostElement: container,
  });

  appRef.attachView(compRef.hostView);

  const router = appRef.injector.get(Router);
  const remaining = baseIndex !== -1 ? fullPath.slice(baseIndex + basePath.length) || '/' : '/';
  await router.navigateByUrl(remaining);
}

export function unmount() {
  document.getElementById('credit-fabric-light')?.remove();
  appRef?.destroy();
  appRef = null;
}
