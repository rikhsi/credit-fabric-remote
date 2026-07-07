import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouteParam } from '@app/constants/route-param';

export function getRootSnapshot(router: Router): ActivatedRouteSnapshot {
  return router.routerState.snapshot.root;
}

export function getCurrentRouteData<T = Record<string, unknown>>(snapshot: ActivatedRouteSnapshot): T {
  const merged: Record<string, unknown> = {};
  let current: ActivatedRouteSnapshot | null = snapshot.root;

  while (current) {
    Object.assign(merged, current.data);
    current = current.firstChild;
  }

  return merged as T;
}

export function getRouteParam(snapshot: ActivatedRouteSnapshot, param: RouteParam | string): string | null {
  let current: ActivatedRouteSnapshot | null = snapshot.root;

  while (current) {
    const value = current.paramMap.get(param) ?? current.params[param];

    if (value) {
      return value;
    }

    current = current.firstChild;
  }

  return null;
}
