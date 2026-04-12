import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
   selector: 'app-signin',
   template: `
      <div class="signin-container">
         <div class="signin-card">
            <h2>Authentication Required</h2>
            <p>You need to be authenticated to access this application.</p>
            <button (click)="signIn()" class="signin-button">Sign In</button>
            <div *ngIf="error" class="error-message">
               {{ error }}
            </div>
         </div>
      </div>
   `,
   styles: [
      `
         .signin-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f5f5f5;
         }

         .signin-card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
         }

         .signin-button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 1rem;
         }

         .signin-button:hover {
            background-color: #0056b3;
         }

         .error-message {
            color: #dc3545;
            margin-top: 1rem;
            padding: 0.5rem;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
         }
      `
   ]
})
export class SigninComponent implements OnInit {
   error: string | null = null;

   constructor(
      private authService: AuthService,
      private router: Router
   ) {}

   ngOnInit(): void {
      // Handle authentication callback if we have token/error in URL
      this.authService.handleAuthCallback();

      // If user is already authenticated, redirect to home
      if (this.authService.isAuthenticated()) {
         this.router.navigate(['/']);
      }
   }

   signIn(): void {
      this.authService.redirectToSignin();
   }
}
