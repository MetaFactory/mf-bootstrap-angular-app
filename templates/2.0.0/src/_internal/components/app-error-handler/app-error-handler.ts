import { ErrorHandler } from '@angular/core'

export class AppErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // if it's API error, then already show
    // console.log('AppErrorHandler', error)
  }
}
