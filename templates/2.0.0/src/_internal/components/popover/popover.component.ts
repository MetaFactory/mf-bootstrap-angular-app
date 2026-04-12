import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

export type PopoverPosition = {
   left?: number;
   right?: number;
   top?: number;
   bottom?: number;
};

@Component({
   selector: 'app-popover',
   standalone: false,
   templateUrl: './popover.component.html',
   styleUrl: './popover.component.scss'
})
export class PopoverComponent implements OnChanges {
   @Input() open: boolean = false;
   @Input() anchorRect?: DOMRect;
   @Input() maxHeight?: number;
   @Input() maxWidth?: number;
   @Input() blurBackdrop: boolean = false;
   @Output() close = new EventEmitter<void>();
   position?: PopoverPosition;

   handleClose() {
      this.close.emit();
   }

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['anchorRect']) {
         this.repositionPopover();
      }
   }

   repositionPopover() {
      if (!this.anchorRect) return;

      let left, right, top, bottom;
      const padding = 2;

      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - this.anchorRect.bottom;
      const spaceAbove = this.anchorRect.top;

      if (this.maxHeight) {
         // Check if there's enough space below
         if (spaceBelow < this.maxHeight && spaceAbove > this.maxHeight) {
            bottom = viewportHeight - this.anchorRect.top; // Place above
         } else {
            top = this.anchorRect.bottom; // Default is below
         }
      }

      const aL = this.anchorRect.left;
      const aR = this.anchorRect.right;
      const vW = window.innerWidth;
      const pW = this.maxWidth;
      // console.log('aL,aR,vW,pW,pw', aL, aR, vW, pW);

      if (pW) {
         if (aL < padding) {
            // A
            left = padding;
         } else if (aL + pW <= vW) {
            // B
            left = aL;
         } else if (aR >= vW) {
            // E
            right = padding;
         } else if (aR >= pW) {
            // D
            right = vW - aR;
         } else {
            // C
            left = vW - pW;
         }
      }

      this.position = { left, right, bottom, top };
   }
}
