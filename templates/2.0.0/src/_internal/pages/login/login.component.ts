import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import pkg from '../../../../package.json';
import { GeneralService } from '../../services/general';
import { GeneralState } from '../../services/general/general.state';
import { UserService } from '../../services/user';

@Component({
   selector: 'app-login',
   standalone: false,
   templateUrl: './login.component.html',
   styleUrl: './login.component.scss'
})
export class LoginComponent {
   public form: FormGroup;
   error = '';
   version = `(Version ${pkg.version})`;

   // From Redux
   general$!: BehaviorSubject<GeneralState>;

   constructor(
      private service: UserService,
      private fb: FormBuilder,
      private generalService: GeneralService
   ) {
      this.form = this.fb.group({ username: '', password: '', rememberMe: true });
      this.general$ = this.generalService.select<GeneralState>((state) => state);
   }

   async login() {
      const { username, password, rememberMe } = this.form.value;
      const result = await this.service.authenticate(username, password, rememberMe ?? true);

      switch (result) {
         case 'Success':
            window.location.href = '/';
            break;

         case 'TimeoutError':
         case 'NetworkIssue':
            this.error = 'Connection to the API service failed!';
            break;

         case 'BadRequest':
         case 'InvalidUserPass':
            this.error = 'Invalid username or bad password';
            break;

         default:
            this.error = 'Unknown issue';
            break;
      }
   }
}
