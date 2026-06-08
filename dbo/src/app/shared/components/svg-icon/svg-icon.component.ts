import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ICONS_TYPE } from '../../types';
import { ICON_COLORS } from 'src/app/constants';

type MaterialColor = 'primary' | 'accent' | 'warn';

@Component({
  selector: 'app-svg-icon',
  imports: [MatIconModule, NgStyle],
  templateUrl: './svg-icon.component.html',
  styles: [
    `
      .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      mat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgIconComponent {
  size = input(20);
  height = input<number>();
  width = input<number>();
  name = input.required<ICONS_TYPE | undefined>();
  color = input<ICON_COLORS | MaterialColor | string>('#7E89AC');
  gap = input<number>();
  classes = input<string>('');
  ariaLabel = input<string>();
  clicked = output<void>();
  rotateSize = input(0);

  getIconStyles() {
    const styles: any = {
      transform: `rotate(${this.rotateSize()}deg)`,
      // color: this.color()
    };


    const hasCustomDimensions = this.height() !== undefined || this.width() !== undefined;

    if (!hasCustomDimensions && !this.classes().includes('w-[') && !this.classes().includes('h-[')) {
      styles.fontSize = `${this.size()}px`;
      styles.height = `${this.size()}px`;
      styles.width = `${this.size()}px`;
    } else if (hasCustomDimensions) {
      if (this.height() !== undefined) {
        styles.fontSize = `${this.height()}px`;
        styles.height = `${this.height()}px`;
      }
      if (this.width() !== undefined) {
        styles.width = `${this.width()}px`;
      }
    }

    return styles;
  }

  resolvedColor() {
    const color = this.color();
    const colorMap: { [key in ICON_COLORS | MaterialColor]?: string } = {
      '#7E89AC': '#7E89AC',
      '#C64CFF': '#C64CFF',
      white: 'white',
      '#05C168': '#05C168',
      '#FF9E2C': '#FF9E2C',
      '#00C2FF': '#00C2FF',
      '#F85FD2': '#F85FD2',
      '#BFA674': '#BFA674',
      '#FF5A65': '#FF5A65',
      primary: 'var(--mdc-theme-primary, #3f51b5)',
      accent: 'var(--mdc-theme-secondary, #ff4081)',
      warn: 'var(--mdc-theme-error, #f44336)',
    };
    return colorMap[color as ICON_COLORS | MaterialColor] || color;
  }
}
