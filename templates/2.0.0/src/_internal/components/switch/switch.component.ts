import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
   selector: 'app-switch',
   standalone: false,
   templateUrl: './switch.component.html',
   styleUrl: './switch.component.scss'
})
export class SwitchComponent {
   @Input() isChecked = false;
   @Output() toggle = new EventEmitter<boolean>();

   toggleSwitch() {
      this.isChecked = !this.isChecked;
      this.toggle.emit(this.isChecked);
   }
}
