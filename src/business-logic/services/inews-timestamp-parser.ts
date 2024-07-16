export class InewsTimestampParser {
  public parse(timestampText: string): number {
    const timePattern: RegExp = /(?<month>[a-z]+)\s+(?<dayOfMonth>[0-9]+)\s+((?<hours>[0-9]{2}):(?<minutes>[0-9]{2})|(?<year>[0-9]{4}))/i
    const matchedGroup: Record<string, string> | undefined = timestampText.match(timePattern)?.groups
    if (!matchedGroup || !matchedGroup['month'] || !matchedGroup['dayOfMonth']) {
      return 0
    }
    const year: string = matchedGroup['year'] ?? new Date().getFullYear().toString()
    const month: string = this.getMonthNumber(matchedGroup['month']).toString().padStart(2, '0')
    const dayOfMonth: string = matchedGroup['dayOfMonth'].padStart(2, '0')
    const hours: string = matchedGroup['hours'] ?? '00'
    const minutes: string = matchedGroup['minutes'] ?? '00'
    const dateString: string = `${year}/${month}/${dayOfMonth} ${hours}:${minutes}:00`
    const date: Date = new Date(dateString)
    if (date.getFullYear() > new Date().getFullYear()) {
      date.setFullYear(new Date().getFullYear())
    }
    if (date.getTime() > Date.now()) {
      date.setFullYear(date.getFullYear() - 1)
    }
    return date.getTime()
  }

  private getMonthNumber(monthName: string): number {
    return new Date(`${monthName} 1 ${new Date().getFullYear()}`).getMonth() + 1
  }
}
