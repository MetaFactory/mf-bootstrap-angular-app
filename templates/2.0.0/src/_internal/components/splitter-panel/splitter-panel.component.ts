import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
   selector: 'app-splitter-panel',
   standalone: false,
   templateUrl: './splitter-panel.component.html',
   styleUrl: './splitter-panel.component.scss'
})
export class SplitterPanelComponent {
   @Input() stateKey?: string;
   @Output() resize = new EventEmitter();
   isResizing = false;

   constructor(private elRef: ElementRef) {}

   initResize(event: MouseEvent) {
      this.isResizing = true;
      event.preventDefault();
   }

   @HostListener('document:mousemove', ['$event'])
   onMouseMove(event: MouseEvent) {
      if (!this.isResizing) {
         return;
      }

      const panelRect = this.elRef.nativeElement
         .querySelector('.splitter-panel')
         .getBoundingClientRect();
      const leftPanel = this.elRef.nativeElement.querySelector('.splitter-panel-left');

      const newWidth = event.clientX - panelRect.left;
      leftPanel.style.maxWidth = `${newWidth}px`;
      this.resize.emit(newWidth);
   }

   @HostListener('document:mouseup', ['$event'])
   onMouseUp() {
      if (this.isResizing) {
         this.isResizing = false;
      }
   }
}
