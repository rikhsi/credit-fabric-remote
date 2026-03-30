import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { Card, LabelControl } from '@shared/components';

@Component({
  selector: 'cf-card-product',
  imports: [NzButtonComponent, NgOptimizedImage, NzTagComponent, Card, TranslocoDirective, LabelControl, RouterLink],
  templateUrl: './card-product.html',
  styleUrl: './card-product.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardProduct {}
