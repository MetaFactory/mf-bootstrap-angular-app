import { Component, Input } from '@angular/core';

export type ButtonVariant = 'contained' | 'outlined' | 'text' | 'rounded';
export type ButtonColor =
   | 'primary'
   | 'secondary'
   | 'danger'
   | 'success'
   | 'warning'
   | 'info'
   | 'light'
   | 'dark';

@Component({
   selector: 'app-button',
   templateUrl: './button.component.html',
   styleUrl: './button.component.scss',
   standalone: false
})
export class ButtonComponent {
   @Input() variant: ButtonVariant = 'contained';
   @Input() color: ButtonColor = 'info';
   @Input() startIcon?: string;
   @Input() endIcon?: string;
   @Input() disabled = false;
   @Input() type?: string;
   @Input() size: 'md' | 'sm' = 'md';
   @Input() href?: string;
   @Input() target: '_blank' | '_self' | '_parent' | '_top' = '_self';
}
