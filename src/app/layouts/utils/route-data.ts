import { ActivatedRouteSnapshot, Router } from '@angular/router';

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
