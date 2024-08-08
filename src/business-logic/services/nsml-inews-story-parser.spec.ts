import { NsmlInewsStoryParser } from './nsml-inews-story-parser'
import { InewsStoryParser } from '../interfaces/inews-story-parser'
import { RegExpNsmlParser } from './reg-exp-nsml-parser'
import { CueType, InewsCue, InewsStory } from '../entities/inews-story'
import { InewsId } from '../entities/inews-id'
import { EntityTestFactory } from '../factories/entity-test-factory'
import { InewsIdParserImplementation } from './inews-id-parser-implementation'

describe(NsmlInewsStoryParser.name, () => {
  describe(NsmlInewsStoryParser.prototype.parseInewsStory.name, () => {
    describe('when fields with non-alphanumeric ids are present', () => {
      it('converts the field ids to camelCase', () => {
        const storyId: string = '001ea938'
        const text: string = `<nsml version="some version 1.0"><head><storyid>${storyId}:00ff8cf0:656994ba</storyid></head><story><fields><f id=title></f><f id=my-weird-key-name>some value</f></fields></story>`
        const inewsId: InewsId = EntityTestFactory.createInewsId({ storyId })
        const testee: InewsStoryParser = createTestee()

        const result: InewsStory = testee.parseInewsStory(text, 'queue-id', inewsId)

        expect(result.metadata).toHaveProperty('myWeirdKeyName')
        expect(result.metadata.myWeirdKeyName).toEqual('some value')
      })
    })

    describe('when story has anchored element references and text paragraphs', () => {
      it('merges anchored elements into the body paragraph order as cues', () => {
        const storyId: string = '001ea938'
        const text: string = `<nsml version="some version 1.0"><head><storyid>${storyId}:00ff8cf0:656994ba</storyid></head><story><fields><f id=title>Segment title</f></fields></fields><body><p><pi>KAM 1</pi></p><p><a idref=0></p><p><a idref=1></p></body><aeset><ae id=0><ap>Line1</ap><ap>Line2</ap></ae><ae id=1><ap>Line3</ap><ap>Line4</ap></ae></aeset></aeset></story>`
        const inewsId: InewsId = EntityTestFactory.createInewsId({ storyId })
        const testee: InewsStoryParser = createTestee()
        const expectedInewsStory: InewsStory = {
          id: '001EA938',
          name: 'Segment title',
          queueId: 'queue-id',
          contentLocator: inewsId.contentLocator,
          versionLocator: inewsId.versionLocator,
          metadata: {},
          rank: 0,
          cues: [
            {
              type: CueType.CONTENT,
              content: ['KAM 1'],
            },
            {
              type: CueType.CONTENT,
              content: ['Line1', 'Line2'],
            },
            {
              type: CueType.CONTENT,
              content: ['Line3', 'Line4'],
            },
          ],
        }

        const result: InewsStory = testee.parseInewsStory(text, 'queue-id', inewsId)

        expect(result).toMatchObject(expectedInewsStory)
      })
    })

    describe('when story has no anchored elements but have anchored element references', () => {
      it('ignores the anchored element references', () => {
        const storyId: string = '001ea938'
        const text: string = `<nsml version="some version 1.0"><head><storyid>${storyId}:00ff8cf0:656994ba</storyid></head><story><fields><f id=title>Segment title</f></fields></fields><body><p><pi>KAM 1</pi></p><p><a idref=0></p></body></story>`
        const inewsId: InewsId = EntityTestFactory.createInewsId({ storyId })
        const testee: InewsStoryParser = createTestee()
        const expectedCues: InewsCue[] = [
          {
            type: CueType.CONTENT,
            content: ['KAM 1'],
          },
        ]

        const result: InewsStory = testee.parseInewsStory(text, 'queue-id', inewsId)

        expect(result.cues).toMatchObject(expectedCues)
      })
    })
  })

  describe('when story id from inews id differs from the story id in the NSML document', () => {
    it('throws an error', () => {
      const text: string = '<nsml version="some version 1.0"><head><storyid>11223344:00ff8cf0:656994ba</storyid></head><story><fields><f id=title>Segment title</f></fields></fields><body><p><pi>KAM 1</pi></p><p><a idref=0></p></body></story>'
      const storyId: string = '001ea938'
      const inewsId: InewsId = EntityTestFactory.createInewsId({ storyId })
      const testee: InewsStoryParser = createTestee()

      const result: () => InewsStory = () => testee.parseInewsStory(text, 'queue-id', inewsId)

      expect(result).toThrow()
    })

    describe('when the only difference is character casing', () => {
      it('uses an uppercased version of the story id', () => {
        const storyId: string = '001EA938'
        const text: string = `<nsml version="some version 1.0"><head><storyid>${storyId.toLowerCase()}:00ff8cf0:656994ba</storyid></head><story><fields><f id=title>Segment title</f></fields></fields><body><p><pi>KAM 1</pi></p><p><a idref=0></p></body></story>`
        const inewsId: InewsId = EntityTestFactory.createInewsId({ storyId })
        const testee: InewsStoryParser = createTestee()

        const result: InewsStory = testee.parseInewsStory(text, 'queue-id', inewsId)

        expect(result.id).toBe(storyId)
      })
    })
  })

  describe('when the locators given differs from the ones in the NSML document', () => {
    it('uses the given locators', () => {
      const inewsId: InewsId = EntityTestFactory.createInewsId({ storyId: '1234ABCD', contentLocator: '11111111', versionLocator: '22222222' })
      const text: string = `<nsml version="some version 1.0"><head><storyid>${inewsId.storyId}:00000000:00000000</storyid></head><story><fields><f id=title>Segment title</f></fields></fields><body><p><pi>KAM 1</pi></p><p><a idref=0></p></body></story>`
      const testee: InewsStoryParser = createTestee()

      const result: InewsStory = testee.parseInewsStory(text, 'queue-id', inewsId)

      expect(result.contentLocator).toBe(inewsId.contentLocator)
      expect(result.versionLocator).toBe(inewsId.versionLocator)
    })
  })

  describe('when story has non-fully uppercased story id and locators', () => {
    it('uppercases the story id', () => {
      const storyId: string = '001ea938'
      const text: string = `<nsml version="some version 1.0"><head><storyid>${storyId}:00ff8cf0:656994ba</storyid></head><story><fields><f id=title>Segment title</f></fields></fields><body><p><pi>KAM 1</pi></p><p><a idref=0></p><p><a idref=1></p></body><aeset><ae id=0><ap>Line1</ap><ap>Line2</ap></ae><ae id=1><ap>Line3</ap><ap>Line4</ap></ae></aeset></aeset></story>`
      const inewsId: InewsId = EntityTestFactory.createInewsId({ storyId })
      const testee: InewsStoryParser = createTestee()

      const result: InewsStory = testee.parseInewsStory(text, 'queue-id', inewsId)

      expect(result.id).toBe('001EA938')
    })

    it('uppercases the story locators', () => {
      const storyId: string = '001ea938'
      const text: string = `<nsml version="some version 1.0"><head><storyid>${storyId}:00ff8cf0:656994ba</storyid></head><story><fields><f id=title>Segment title</f></fields></fields><body><p><pi>KAM 1</pi></p><p><a idref=0></p><p><a idref=1></p></body><aeset><ae id=0><ap>Line1</ap><ap>Line2</ap></ae><ae id=1><ap>Line3</ap><ap>Line4</ap></ae></aeset></aeset></story>`
      const inewsId: InewsId = EntityTestFactory.createInewsId({
        storyId,
        contentLocator: '11aabbcc',
        versionLocator: '22ddeeff',
      })
      const testee: InewsStoryParser = createTestee()

      const result: InewsStory = testee.parseInewsStory(text, 'queue-id', inewsId)

      expect(result.contentLocator).toBe('11AABBCC')
      expect(result.versionLocator).toBe('22DDEEFF')
    })
  })

  describe('when meta tag under head tag has attributes', () => {
    it('puts these into the metadata attribute', () => {
      const storyId: string = '001ea938'
      const text: string = `<nsml version="some version 1.0"><head><meta rate=150 float wire mail><storyid>${storyId}:xxxxx:yyyyy</storyid></head><story><fields><f id=title>title</f></fields><body><p><a idref=0></p><p><cc>Comment</cc></p><p><pi>KAM 1</pi></p><p>MANUS</p></body><aeset><ae id=0><ap>First line=Foo</ap><ap>Second line = BAR</ap></ae></aeset></story>`
      const inewsId: InewsId = EntityTestFactory.createInewsId({
        storyId,
        contentLocator: '11aabbcc',
        versionLocator: '22ddeeff',
      })
      const expectedMetadata: Readonly<Record<string, string>> = {
        title: 'title',
        rate: '150',
        float: 'float',
        wire: 'wire',
        mail: 'mail',
      }
      const testee: InewsStoryParser = createTestee()

      const result: InewsStory = testee.parseInewsStory(text, 'queue-id', inewsId)

      expect(result.metadata).toMatchObject(expectedMetadata)
    })
  })
})

function createTestee(): InewsStoryParser {
  return new NsmlInewsStoryParser(new RegExpNsmlParser(), new InewsIdParserImplementation())
}
