import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'formatHours',
  standalone: false
})
export class FormatHoursPipe implements PipeTransform {
  transform(hours: number): string {
    // Separate the hours into whole hours and the decimal part
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)

    // If there are no minutes, return just the whole hours
    if (minutes === 0) {
      return `${wholeHours}`
    }

    // Format minutes to always be two digits
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes

    return `${wholeHours}:${formattedMinutes}`
  }
}
