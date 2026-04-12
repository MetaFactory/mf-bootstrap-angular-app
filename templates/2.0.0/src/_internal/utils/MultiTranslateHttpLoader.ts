import { HttpClient } from '@angular/common/http'
import { TranslateLoader } from '@ngx-translate/core'
import { Observable, forkJoin } from 'rxjs'
import { map } from 'rxjs/operators'

export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    public fileNames: string[]
  ) {}

  public getTranslation(lang: string): Observable<any> {
    const requests = this.fileNames.map((fileName) => {
      return this.http.get(`/assets/i18n/${lang}/${fileName}.json`)
    })

    return forkJoin(requests).pipe(
      map((response) => {
        return response.reduce((a, b) => {
          return { ...a, ...b }
        })
      })
    )
  }
}
