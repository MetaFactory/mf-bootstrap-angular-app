import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
   selector: 'app-menu-item',
   standalone: false,
   templateUrl: './menu-item.component.html',
   styleUrl: './menu-item.component.scss'
})
export class MenuItemComponent {
   @Input() label!: string;
   @Input() icon?: string;
   @Input() link?: string;
   @Input() value?: unknown;
   @Output() click = new EventEmitter<unknown>();

   handleClick(ev: MouseEvent) {
      ev.stopPropagation();
      ev.preventDefault();
      this.click.emit(this.value);
   }
}
