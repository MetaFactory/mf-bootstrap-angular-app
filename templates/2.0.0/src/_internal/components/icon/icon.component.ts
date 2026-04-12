import { Component, HostBinding, Input } from '@angular/core';
import { ColorScheme } from '../../types';

const ICON_DEFAULT_SIZE = 24; // px

@Component({
   selector: 'mat-icon',
   standalone: false,
   template: '{{ name }}'
})
export class IconComponent {
   @Input() name: string = '';
   @Input() color?: ColorScheme | string;

   /**
    * Icon size (px), default is 24px
    */
   @Input() size?: number;
   @Input() fill = false;

   @HostBinding('class.material-symbols-outlined') matClass = true;

   @HostBinding('style.font-size.px') get iconSize() {
      return this.size || ICON_DEFAULT_SIZE;
   }

   @HostBinding('style.color') get iconColor() {
      return this.color ? 'var(--' + this.color + ')' : 'inherit';
   }

   @HostBinding('style.font-variation-settings') get fontVariation() {
      return `'FILL' ${this.fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`;
   }
}
