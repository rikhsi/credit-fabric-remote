import { ActivatedRouteSnapshot, Router } from '@angular/router';

export function getRootSnapshot(router: Router): ActivatedRouteSnapshot {
  return router.routerState.snapshot.root;
}

export function getCurrentRouteData<T = Record<string, unknown>>(snapshot: ActivatedRouteSnapshot): T {
  let deepest: ActivatedRouteSnapshot = snapshot.root;

  while (deepest.firstChild) {
    deepest = deepest.firstChild;
  }

  return <T>deepest.data ?? <T>{};
}
