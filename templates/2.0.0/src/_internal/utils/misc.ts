import { ElementRef } from '@angular/core';

const SAFE_INPUT_FOCUS_DELAY = 100; // ms

export function safeElementFocus(element: ElementRef<HTMLInputElement>) {
   setTimeout(() => element.nativeElement.focus(), SAFE_INPUT_FOCUS_DELAY);
}
