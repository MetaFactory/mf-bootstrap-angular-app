import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { GeneralService } from '../../services/general';
import { FormAction, FormActionContext, FormActionState } from '../../types';

@Component({
   selector: 'app-free-form-modal',
   standalone: false,
   templateUrl: './free-form-modal.component.html',
   styleUrl: './free-form-modal.component.scss'
})
export class FreeFormModalComponent {
   @Input() context!: FormActionContext;
   @Output() onClose = new EventEmitter<boolean>();
   data: any;
   formIsValid: boolean = true;
   formActionState: FormActionState = 'Idle';

   constructor(private generalService: GeneralService) {}

   async ngOnChanges(changes: SimpleChanges) {
      if (changes['context']) {
         this.data = this.context.state;
         if (this.context.schema?.fields?.length) {
            // Empty forms, e.g. Confirm Delete Modals, are valid by default. otherwise, false, waiting for a valid update
            this.formIsValid = false;
         }
      }
   }

   handleChange(ev: any) {
      this.data = ev;
   }

   handleFormValidity(isValid: boolean) {
      this.formIsValid = isValid;
   }

   async processAction(action: FormAction) {
      try {
         this.formActionState = 'Running';
         const cn = {
            ...this.context,
            state: { ...(this.context.state as any), ...this.data }
         };
         await this.generalService.processAction(action, cn);
         this.formActionState = 'Idle';
         this.onClose.emit();
      } catch (ex) {
         this.formActionState = 'Idle';
         throw ex;
      }
   }
}
