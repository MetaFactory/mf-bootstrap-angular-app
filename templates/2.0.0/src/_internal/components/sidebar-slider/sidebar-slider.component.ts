import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
   selector: 'app-sidebar-slider',
   standalone: false,
   templateUrl: './sidebar-slider.component.html',
   styleUrl: './sidebar-slider.component.scss'
})
export class SidebarSliderComponent {
   @Input() isOpen = false;
   @Output() onClose = new EventEmitter<void>();

   @HostListener('document:keydown.escape', ['$event'])
   handleEscapeKey() {
      this.onClose.emit();
   }
}
