import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityService, GeneralService } from '../../services';
import { FormSchema } from '../../types';

@Component({
   selector: 'app-dynamic-form',
   standalone: false,
   templateUrl: './dynamic-form.component.html'
})
export class DynamicFormComponent implements OnInit, OnChanges {
   @Input() schema?: FormSchema | any;
   @Input() path?: string;
   @Input() standalone = true;
   service?: EntityService;

   constructor(
      private route: ActivatedRoute,
      private router: Router,
      private generalService: GeneralService
   ) {}

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['schema'] && this.schema) {
         this.service = this.generalService.getEntityService(this.schema.serviceName);
      }
   }

   ngOnInit() {
      const { schema } = this.route.snapshot.data;
      if (schema) {
         this.path = this.router.url;
         this.schema = schema;
         this.service = this.generalService.getEntityService(this.schema.serviceName);
      }
   }

   closeDetailsPage() {
      if (this.standalone) {
         location.reload();
      } else {
         this.generalService.closeDetailsSection();
      }
   }
}
