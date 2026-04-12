import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
   selector: 'app-backdrop',
   standalone: false,
   templateUrl: './backdrop.component.html',
   styleUrl: './backdrop.component.scss'
})
export class BackdropComponent {
   @Input() open: boolean = false;
   @Input() blur: boolean = false;
   @Output() hide = new EventEmitter<void>();

   handleClick(ev: MouseEvent) {
      ev.preventDefault();
      ev.stopPropagation();
      this.hide.emit();
   }
}
