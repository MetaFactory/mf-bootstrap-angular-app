import {
   Component,
   ElementRef,
   EventEmitter,
   Input,
   OnChanges,
   OnDestroy,
   OnInit,
   Output,
   Renderer2,
   SimpleChanges,
   ViewChild,
   forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ConfigService } from '../../services';
import { KeyCode, SelectOption } from '../../types';
import { readLocalStorage, safeElementFocus, writeLocalStorage } from '../../utils';
import { PopoverPosition } from '../popover/popover.component';

@Component({
   selector: 'app-select',
   standalone: false,
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: forwardRef(() => SelectComponent),
         multi: true
      }
   ],
   templateUrl: './select.component.html',
   styleUrl: './select.component.scss'
})
export class SelectComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges {
   /**
    * Placeholder text shown when no option is selected
    */
   @Input() placeholder?: string;

   /**
    * Name of the select component, used for identification
    */
   @Input() name?: string;

   /**
    * HTML ID of the component
    */
   @Input() id?: string;

   /**
    * Options available for selection
    */
   @Input() options?: SelectOption[];

   /**
    * Whether multiple selections are allowed
    */
   @Input() multi: boolean = false;

   /**
    * Show a button to reset/clear the selection
    */
   @Input() resetButton: boolean = false;

   /**
    * Key used to store/retrieve favorite options from localStorage
    */
   @Input() favoriteKey?: string;

   /**
    * Whether to enable auto-complete search behavior
    */
   @Input() autoComplete = false;

   /**
    * Whether to auto-focus the select input on init
    */
   @Input() autofocus = false;

   /**
    * Maximum width of the select dropdown
    */
   @Input() maxWidth?: number;

   /**
    * Maximum height of the select dropdown
    */
   @Input() maxHeight?: number;

   /**
    * Whether the component is in an error state
    */
   @Input() hasError: boolean = false;

   /**
    * Error message to display when in error state
    */
   @Input() errorText: string = 'Something went wrong';

   @Output() onOptionsSearch = new EventEmitter<string>();
   @Output() change = new EventEmitter<unknown>();

   @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
   @ViewChild('optionsList') optionsList!: ElementRef<HTMLUListElement>;
   @ViewChild('buttonRef') buttonRef!: ElementRef<HTMLButtonElement>;

   activeIndex = 0;
   selectedOptions: SelectOption[] = [];
   onChange(value?: SelectOption | SelectOption[] | null) {}
   onTouched() {}
   isOptionsVisible = false;
   visibleOptions: SelectOption[] = [];
   searchPhrase = '';
   favoriteOptions: SelectOption[] = [];
   allowSearch = true;
   popoverPosition: PopoverPosition = {};
   inputRect?: DOMRect;

   constructor(
      private el: ElementRef,
      private renderer: Renderer2,
      public config: ConfigService
   ) {}

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['name'] && this.name) {
         this.renderer.setAttribute(this.el.nativeElement, 'data-name', this.name); // Used as selector for testing and styling
      }

      if (changes['favoriteKey'] && this.favoriteKey) {
         this.favoriteOptions = readLocalStorage<SelectOption[]>(this.favoriteKey) || [];
      }

      if (changes['options']) {
         this.refreshVisibleOptions();
      }

      if (changes['autoComplete']) {
         this.allowSearch =
            this.autoComplete ||
            !this.options ||
            this.options.length > this.config.value.selectNoSearchMaxItems;
      }
   }

   ngOnInit() {
      window.addEventListener('resize', () => this.onWindowResize());
      window.addEventListener('keydown', this.onWindowKeydown);
   }

   ngOnDestroy() {
      window.removeEventListener('resize', this.onWindowResize);
      window.removeEventListener('keydown', this.onWindowKeydown);
   }

   onWindowResize() {
      if (this.buttonRef) {
         this.inputRect = this.buttonRef.nativeElement.getBoundingClientRect();
      }
   }

   onWindowKeydown(ev: KeyboardEvent) {
      if (this.isOptionsVisible) {
         switch (ev.code) {
            case KeyCode.ArrowDown:
               this.activeIndex =
                  this.activeIndex < this.visibleOptions.length - 1
                     ? this.activeIndex + 1
                     : this.activeIndex;
               this.scrollOptionIntoView();
               ev.preventDefault();
               break;

            case KeyCode.ArrowUp:
               ev.preventDefault();
               this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : 0;
               this.scrollOptionIntoView();
               break;

            case KeyCode.Enter:
               ev.preventDefault();
               this.selectOption(this.visibleOptions[this.activeIndex], ev);
               break;

            case KeyCode.Escape:
               this.hideOptions();
               break;
         }
      }
   }

   hideOptions() {
      this.isOptionsVisible = false;
   }

   get displayValue() {
      let value = this.selectedOptions[0]?.displayValue || this.placeholder || '';
      if (this.selectedOptions.length > 1) {
         value += ` +${this.selectedOptions.length - 1}`;
      }
      return value;
   }

   setValue(value: any): void {
      if (value && !Array.isArray(value)) {
         this.selectedOptions = [value];
      } else {
         this.selectedOptions = value || [];
      }
   }

   writeValue(value: any): void {
      this.setValue(value);
   }

   optionIsSelected(option: SelectOption) {
      return this.selectedOptions.some(({ id }) => id === option?.id);
   }

   registerOnChange(fn: any): void {
      this.onChange = fn;
   }

   registerOnTouched(fn: any): void {
      this.onTouched = fn;
   }

   setDisabledState?(isDisabled: boolean): void {
      // throw new Error('Method not implemented.')
   }

   selectOption(option: SelectOption, ev: MouseEvent | KeyboardEvent) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      ev.stopPropagation();

      if (this.multi) {
         this.selectedOptions = this.selectedOptions?.some((selected) => selected.id === option.id)
            ? this.selectedOptions?.filter((selected) => selected.id !== option.id)
            : [...(this.selectedOptions || []), option];
         this.selectedOptions;
      } else {
         this.selectedOptions = [option];
         this.hideOptions();
      }

      this.change.emit(this.getValue());
      this.onChange(this.getValue());
   }

   toggleShowOptions() {
      this.inputRect = this.buttonRef.nativeElement.getBoundingClientRect();
      this.isOptionsVisible = !this.isOptionsVisible;

      if (this.isOptionsVisible) {
         safeElementFocus(this.searchInput!);

         // Check autocomplete necessity
         if (!this.options?.length && !this.autoComplete) {
            console.warn(
               `Warning on select component for '${this.name}': options are empty while autoComplete is also false!`
            );
         }
      }
      this.refreshVisibleOptions();
   }

   refreshVisibleOptions() {
      let options = [...(this.options || [])];

      // Move favorite options to the top
      if (this.favoriteOptions.length > 0) {
         options = options.filter(
            (option) => !this.favoriteOptions.some((fav) => fav.id === option?.id)
         );
         options = [...this.favoriteOptions, ...options];
      }

      options = options.sort((a, b) => this.isFavorite(b) - this.isFavorite(a));

      if (!this.autoComplete) {
         const phrase = this.searchPhrase.trim().toLowerCase();
         if (phrase) {
            options = options.filter((option) =>
               option?.displayValue.toLowerCase().includes(phrase)
            );
         }
      }
      this.visibleOptions = options;
   }

   getValue() {
      return this.multi ? this.selectedOptions : this.selectedOptions[0];
   }

   onSearchChange() {
      if (this.autoComplete) {
         this.onOptionsSearch.emit(this.searchPhrase);
      } else {
         this.refreshVisibleOptions();
      }
   }

   get hasValue() {
      return this.selectedOptions.length > 0;
   }

   resetValues(ev: MouseEvent) {
      ev.stopPropagation();
      this.selectedOptions = [];
      this.change.emit(this.multi ? [] : null);
      this.onChange(this.multi ? [] : null);
      this.hideOptions();
   }

   isFavorite(option: SelectOption) {
      return this.favoriteOptions.some((fav) => fav.id === option?.id) ? 1 : 0;
   }

   toggleFavorite(option: SelectOption, ev: MouseEvent) {
      ev.preventDefault();
      ev.stopPropagation();

      if (this.favoriteOptions.some((fav) => fav.id === option.id)) {
         this.favoriteOptions = this.favoriteOptions.filter((fav) => fav.id !== option.id);
      } else {
         this.favoriteOptions = [...this.favoriteOptions, option];
      }

      writeLocalStorage(this.favoriteKey!, this.favoriteOptions);
      this.refreshVisibleOptions();
   }

   scrollOptionIntoView() {
      const optionElement = this.optionsList.nativeElement.children[this.activeIndex];
      if (optionElement) {
         optionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
   }
}
