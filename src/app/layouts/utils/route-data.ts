import { ActivatedRouteSnapshot, Router } from '@angular/router';

export function getRootSnapshot(router: Router): ActivatedRouteSnapshot {
  return router.routerState.snapshot.root;
}

export function getCurrentRouteData(snapshot: ActivatedRouteSnapshot): Record<string, unknown> {
  let deepest: ActivatedRouteSnapshot = snapshot.root;

  while (deepest.firstChild) {
    deepest = deepest.firstChild;
  }

  return deepest.data ?? {};
}
