import {
   Component,
   ComponentFactoryResolver,
   Input,
   OnChanges,
   SimpleChanges,
   Type,
   ViewChild
} from '@angular/core';
import { DynamicComponentHostDirective } from '../../directives';

@Component({
   selector: 'app-custom-modal-host',
   standalone: false,
   templateUrl: './custom-modal-host.component.html',
   styleUrl: './custom-modal-host.component.css'
})
export class CustomModalHostComponent implements OnChanges {
   @Input() component?: Type<any>;
   @ViewChild(DynamicComponentHostDirective, { static: true })
   dynamicHost!: DynamicComponentHostDirective;

   constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['component']) {
         if (!this.component) return;

         const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
            this.component
         );
         const viewContainerRef = this.dynamicHost.viewContainerRef;
         viewContainerRef.clear();

         const componentRef = viewContainerRef.createComponent(componentFactory);
      }
   }
}
