import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColorScheme } from '../../types';

@Component({
   selector: 'app-icon-button',
   standalone: false,
   templateUrl: './icon-button.component.html',
   styleUrl: './icon-button.component.scss'
})
export class IconButtonComponent {
   @Input() icon!: string;
   @Input() color?: ColorScheme | string;
   @Input() bgColor: string = 'transparent';
   @Input() size: string = 'md';
   @Input() iconSize?: number;
   @Input() tooltip?: string;
   @Input() css?: string;
   @Input() rotate?: number; // degree
   @Input() disabled?: boolean;
   @Output() press = new EventEmitter<MouseEvent>();

   onClick($event: MouseEvent) {
      if (this.disabled) {
         $event.stopImmediatePropagation();
         $event.preventDefault();
      } else {
         this.press.emit($event);
      }
   }
}
