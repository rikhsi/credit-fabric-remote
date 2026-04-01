import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCheckboxComponent } from 'ng-zorro-antd/checkbox';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  selector: 'cf-product-acception',
  imports: [NzCheckboxComponent, NzButtonComponent, NzIconDirective, RouterLink],
  templateUrl: './product-acception.html',
  styleUrl: './product-acception.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAcception {}
