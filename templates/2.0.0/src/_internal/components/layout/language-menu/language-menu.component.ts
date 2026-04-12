import { Component, EventEmitter, Input, Output } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { SelectOption } from '../../../types'

@Component({
  selector: 'app-language-menu',
  standalone: false,
  templateUrl: './language-menu.component.html'
})
export class LanguageMenuComponent {
  @Input() open!: boolean
  @Output() close = new EventEmitter()
  @Input() languages!: SelectOption[]
  @Input() version = ''

  constructor(private translate: TranslateService) {
    //
  }

  chooseLanguage(language: unknown) {
    localStorage.setItem('language', String(language))
    this.translate.use(String(language))
    this.close.emit()
  }
}
