import { InewsTimestampParser } from './inews-timestamp-parser'

describe(InewsTimestampParser.name, () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024/06/01 00:00:00'))
  })
  afterEach(() => jest.useRealTimers())

  describe('when the format is "<month> <dayOfMonth> <year>"', () => {
    describe('when timestamp is in the past', () => {
      it('returns epoch timestamp for that date', () => {
        const inewsTimestampText: string = 'May 22 2024'
        const expectedTime: number = new Date('2024/05/22 00:00:00').getTime()
        const testee: InewsTimestampParser = createTestee()

        const result: number = testee.parse(inewsTimestampText)

        expect(result).toBe(expectedTime)
      })
    })
    describe('when timestamp is in the future', () => {
      describe('when timestamp is in a future year, but prior month (May 22 3000)', () => {
        it('returns epoch timestamp for the date with the year set to the current year', () => {
          const inewsTimestampText: string = 'May 22 3000'
          const expectedTime: number = new Date('2024/05/22 00:00:00').getTime()
          const testee: InewsTimestampParser = createTestee()

          const result: number = testee.parse(inewsTimestampText)

          expect(result).toBe(expectedTime)
        })
      })
    })

    describe('when timestamp is in the same year', () => {
      it('returns epoch timestamp for the date with the year set to last year', () => {
        const inewsTimestampText: string = 'Aug 05 2024'
        const expectedTime: number = new Date('2023/08/05 00:00:00').getTime()
        const testee: InewsTimestampParser = createTestee()

        const result: number = testee.parse(inewsTimestampText)

        expect(result).toBe(expectedTime)
      })
    })
  })

  describe('when the format is "<month> <dayOfMonth> <hours>:<minutes>"', () => {
    describe('when timestamp is in the past', () => {
      it('returns epoch timestamp for the datetime', () => {
        const inewsTimestampText: string = 'Jan 19 19:24'
        const expectedTime: number = new Date('2024/01/19 19:24:00').getTime()
        const testee: InewsTimestampParser = createTestee()

        const result: number = testee.parse(inewsTimestampText)

        expect(result).toBe(expectedTime)
      })
    })

    describe('when timestamp is in the future', () => {
      it('returns epoch timestamp for the datetime with the year set to last year', () => {
        const inewsTimestampText: string = 'Dec 24 12:34'
        const expectedTime: number = new Date('2023/12/24 12:34:00').getTime()
        const testee: InewsTimestampParser = createTestee()

        const result: number = testee.parse(inewsTimestampText)

        expect(result).toBe(expectedTime)
      })
    })
  })
})

function createTestee(): InewsTimestampParser {
  return new InewsTimestampParser()
}
