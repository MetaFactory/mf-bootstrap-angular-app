import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import urlJoin from 'url-join';
import { config } from '../config';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
   constructor(private router: Router) {}

   /**
    * Store the session token after successful authentication
    */
   setSessionToken(token: string): void {
      localStorage.setItem('sessionToken', token);
   }

   /**
    * Get the current session token
    */
   getSessionToken(): string | null {
      return localStorage.getItem('sessionToken');
   }

   /**
    * Clear the session token
    */
   clearSession(): void {
      localStorage.removeItem('sessionToken');
   }

   /**
    * Check if user is authenticated
    */
   isAuthenticated(): boolean {
      return !!this.getSessionToken();
   }

   /**
    * Handle authentication callback from backend
    */
   handleAuthCallback(): void {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (error) {
         console.error('Authentication error:', error);
         // Handle authentication error (show error message, etc.)
         return;
      }

      if (token) {
         this.setSessionToken(token);
         // Remove the token from URL to avoid exposing it
         const url = new URL(window.location.href);
         url.searchParams.delete('token');
         window.history.replaceState({}, document.title, url.toString());
      }
   }

   /**
    * Logout user
    */
   logout(): void {
      const token = this.getSessionToken();
      this.clearSession();

      if (token) {
         // Call backend logout endpoint
         const logoutUrl = `${config.apiBaseUrl}logout?token=${encodeURIComponent(token)}`;
         window.location.href = logoutUrl;
      } else {
         // Redirect to signin page
         this.router.navigate(['/signin']);
      }
   }

   /**
    * Redirect to signin page
    */
   redirectToSignin(): void {
      const currentUrl = encodeURIComponent(window.location.href);
      const signinUrl = urlJoin(config.apiBaseUrl, `signin?back=${currentUrl}`);
      window.location.href = signinUrl;
   }
}
