import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
   selector: 'app-modal',
   standalone: false,
   templateUrl: './modal.component.html',
   styleUrl: './modal.component.scss'
})
export class ModalComponent implements OnInit {
   @Input() isOpen = false;
   @Input() title = '';
   @Output() close = new EventEmitter();

   ngOnInit() {}
}
