import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
   selector: '[appDynamicComponentHost]',
   standalone: false
})
export class DynamicComponentHostDirective {
   constructor(public viewContainerRef: ViewContainerRef) {}
}
