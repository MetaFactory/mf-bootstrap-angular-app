import { Component } from '@angular/core';

@Component({
   selector: 'app-general-error',
   standalone: false,
   templateUrl: './general-error.component.html',
   styleUrls: ['./general-error.component.css']
})
export class GeneralErrorComponent {
   goBack() {
      window.history.back();
   }
}
