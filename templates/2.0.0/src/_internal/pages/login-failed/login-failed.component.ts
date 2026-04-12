import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
   selector: 'app-login-failed',
   standalone: false,
   templateUrl: './login-failed.component.html',
   styleUrls: ['./login-failed.component.css']
})
export class LoginFailedComponent {
   readonly errorMessage$ = this.route.queryParamMap.pipe(
      map((params) => params.get('message')?.trim() || null)
   );

   constructor(private readonly route: ActivatedRoute) {}

   goBack() {
      window.history.back();
   }
}
