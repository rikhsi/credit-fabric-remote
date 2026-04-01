import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IsActiveMatchOptions, NavigationEnd, Router, UrlTree } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

/** То же, что принимает `routerLink`: абсолютный путь или массив сегментов. */
export type StepRouteLink = string | ReadonlyArray<string | number>;

export interface StepItem {
  link: StepRouteLink;
}

const IS_ACTIVE_OPTS: IsActiveMatchOptions = {
  paths: 'subset',
  queryParams: 'ignored',
  fragment: 'ignored',
  matrixParams: 'ignored',
};

@Component({
  selector: 'cf-step',
  imports: [],
  templateUrl: './step.html',
  styleUrl: './step.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step {
  private readonly router = inject(Router);

  private readonly afterNav = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => undefined as void),
      startWith(undefined),
    ),
    { initialValue: undefined },
  );

  readonly steps = input.required<readonly StepItem[]>();

  readonly ariaLabel = input<string>('Прогресс');

  /** Индекс самого «узкого» совпадения с текущим URL (последний подходящий шаг в порядке конфига). */
  readonly activeIndex = computed(() => {
    this.afterNav();
    const cfg = this.steps();
    if (!cfg.length) {
      return 0;
    }
    let best = -1;
    for (let i = 0; i < cfg.length; i++) {
      const tree = this.toUrlTree(cfg[i].link);
      if (this.router.isActive(tree, IS_ACTIVE_OPTS)) {
        best = i;
      }
    }
    return best >= 0 ? best : 0;
  });

  private toUrlTree(link: StepRouteLink): UrlTree {
    if (typeof link === 'string') {
      const path = link.split('?')[0];
      if (path.startsWith('/')) {
        return this.router.parseUrl(path);
      }
      return this.router.parseUrl(`/${path.replace(/^\//, '')}`);
    }
    return this.router.createUrlTree([...link]);
  }
}
