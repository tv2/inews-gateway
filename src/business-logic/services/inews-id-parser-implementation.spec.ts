import { InewsIdParserImplementation } from './inews-id-parser-implementation'
import { InewsId } from '../entities/inews-id'

describe(InewsIdParserImplementation.name, () => {
  describe(InewsIdParserImplementation.prototype.parseInewsId, () => {
    describe('when less than 3 fragments are given', () => {
      it('throws an error', () => {
        const text: string = 'ABCD:1234'
        const testee: InewsIdParserImplementation = createTestee()

        const result: () => InewsId = () => testee.parseInewsId(text)

        expect(result).toThrow()
      })
    })

    describe('when more than 3 fragments are given', () => {
      it('throws an error', () => {
        const text: string = 'ABCD:1234:QWERTY:9876'
        const testee: InewsIdParserImplementation = createTestee()

        const result: () => InewsId = () => testee.parseInewsId(text)

        expect(result).toThrow()
      })
    })

    describe('when 3 fragments are given', () => {
      describe('when all 3 fragments have content', () => {
        it('returns the parsed InewsId', () => {
          const text: string = 'ABCD:1234:QWERTY'
          const testee: InewsIdParserImplementation = createTestee()

          const result: InewsId = testee.parseInewsId(text)

          expect(result).toMatchObject({
            storyId: 'ABCD',
            contentLocator: '1234',
            versionLocator: 'QWERTY',
          })
        })

        it('uppercases all values', () => {
          const text: string = 'abcd:12x4:qwerty'
          const testee: InewsIdParserImplementation = createTestee()

          const result: InewsId = testee.parseInewsId(text)

          expect(result).toMatchObject({
            storyId: 'ABCD',
            contentLocator: '12X4',
            versionLocator: 'QWERTY',
          })
        })
      })

      describe('when one or more fragments are empty', () => {
        it('throws an error', () => {
          const text: string = 'ABCD::QWERTY'
          const testee: InewsIdParserImplementation = createTestee()

          const result: () => InewsId = () => testee.parseInewsId(text)

          expect(result).toThrow()
        })
      })
    })
  })
})

function createTestee(): InewsIdParserImplementation {
  return new InewsIdParserImplementation()
}
