import { AfterViewInit, Component, ElementRef, HostListener, Input } from '@angular/core';

type Placement =
   | 'top-start'
   | 'top'
   | 'top-end'
   | 'left-start'
   | 'left'
   | 'left-end'
   | 'bottom-start'
   | 'bottom'
   | 'bottom-end'
   | 'right-end'
   | 'right'
   | 'right-start';

@Component({
   selector: 'app-tooltip',
   standalone: false,
   templateUrl: './tooltip.component.html',
   styleUrl: './tooltip.component.scss'
})
export class TooltipComponent implements AfterViewInit {
   @Input() title: string = '';
   @Input() placement: Placement = 'bottom';
   visible: boolean = false;
   tooltipPosition: { top: string; left: string; opacity: number } = {
      top: '0px',
      left: '0px',
      opacity: 0
   };
   tooltipElem: HTMLElement | null = null;
   distance = 15; // px

   constructor(private el: ElementRef) {}

   @HostListener('mouseenter') onMouseEnter() {
      this.visible = true;
      this.setPosition();
   }

   @HostListener('mouseleave') onMouseLeave() {
      this.visible = false;
      this.tooltipPosition.opacity = 0;
   }

   ngAfterViewInit() {
      this.tooltipElem = this.el.nativeElement.querySelector('.tooltip');
   }

   private setPosition() {
      if (this.tooltipElem) {
         const hostRect = this.el.nativeElement.getBoundingClientRect();
         const tooltipRect = this.tooltipElem.getBoundingClientRect();
         let top = 0,
            left = 0;

         switch (this.placement) {
            case 'top':
            case 'bottom':
               left = (hostRect.width - tooltipRect.width) / 2;
               break;

            case 'top-start':
            case 'bottom-start':
               left = 0;
               break;

            case 'top-end':
            case 'bottom-end':
               left = hostRect.width - tooltipRect.width;
               break;

            case 'right':
            case 'right-start':
            case 'right-end':
               left = hostRect.width + this.distance;
               break;

            case 'left':
            case 'left-start':
            case 'left-end':
               left = -tooltipRect.width - this.distance;
               break;
         }

         switch (this.placement) {
            case 'top':
            case 'top-start':
            case 'top-end':
               top = -tooltipRect.height - this.distance;
               break;

            case 'bottom':
            case 'bottom-start':
            case 'bottom-end':
               top = tooltipRect.height + this.distance;
               break;

            case 'left':
            case 'right':
               top = (tooltipRect.height - hostRect.height) / 2;
               break;

            case 'left-start':
            case 'right-start':
               top = 0;
               break;

            case 'left-end':
            case 'right-end':
               top = tooltipRect.height - hostRect.height;
               break;
         }

         this.tooltipPosition = { top: `${top}px`, left: `${left}px`, opacity: 1 };
      }
   }
}
