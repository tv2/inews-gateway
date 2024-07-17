import { InewsFtpTimestampParser } from '../interfaces/inews-ftp-timestamp-parser'

export class InewsFtpTimestampParserImplementation implements InewsFtpTimestampParser {
  public parseInewsFtpTimestamp(timestampText: string): number {
    const timePattern: RegExp = /(?<month>[a-z]+)\s+(?<dayOfMonth>\d+)\s+((?<hours>\d{2}):(?<minutes>\d{2})|(?<year>\d{4}))/i
    const matchedGroup: Record<string, string> | undefined = timePattern.exec(timestampText)?.groups
    if (!matchedGroup?.month || !matchedGroup.dayOfMonth) {
      return 0
    }

    const year: string = matchedGroup.year ?? new Date().getFullYear().toString()
    const month: string = this.getMonthNumber(matchedGroup.month).toString().padStart(2, '0')
    const dayOfMonth: string = matchedGroup.dayOfMonth.padStart(2, '0')
    const hours: string = matchedGroup.hours ?? '00'
    const minutes: string = matchedGroup.minutes ?? '00'
    const dateString: string = `${year}/${month}/${dayOfMonth} ${hours}:${minutes}:00`
    const date: Date = new Date(dateString)

    if (this.isDateInAFutureYear(date)) {
      date.setFullYear(new Date().getFullYear())
    }

    if (this.isDateInTheFuture(date)) {
      date.setFullYear(date.getFullYear() - 1)
    }

    return date.getTime()
  }

  private isDateInAFutureYear(date: Date): boolean {
    return date.getFullYear() > new Date().getFullYear()
  }

  private isDateInTheFuture(date: Date): boolean {
    return date.getTime() > Date.now()
  }

  private getMonthNumber(monthName: string): number {
    return new Date(`${monthName} 1 ${new Date().getFullYear()}`).getMonth() + 1
  }
}
