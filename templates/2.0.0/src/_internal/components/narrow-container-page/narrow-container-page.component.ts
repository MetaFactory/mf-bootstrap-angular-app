import { Component, Input, OnInit } from '@angular/core';

@Component({
   selector: 'app-narrow-container-page',
   standalone: false,
   templateUrl: './narrow-container-page.component.html',
   styleUrl: './narrow-container-page.component.scss'
})
export class NarrowContainerPageComponent implements OnInit {
   @Input() title!: string;
   constructor() {}

   ngOnInit() {}
}
