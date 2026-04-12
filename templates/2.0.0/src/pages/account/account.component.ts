import { Component } from '@angular/core';
import { config } from 'src/config';
import { StoreService } from 'src/services';

@Component({
   selector: 'app-account',
   templateUrl: './account.component.html',
   styleUrl: './account.component.scss',
   standalone: false
})
export class AccountComponent {
   userPhoto = config.userPhoto ?? '';
   languages = config.languages;
   version = config.version;

   constructor(public store: StoreService) {}
}
