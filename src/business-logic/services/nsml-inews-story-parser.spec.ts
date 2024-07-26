import { NsmlInewsStoryParser } from './nsml-inews-story-parser'
import { InewsStoryParser } from '../interfaces/inews-story-parser'
import { RegExpNsmlParser } from './reg-exp-nsml-parser'
import { CueType, InewsCue, InewsStory } from '../entities/inews-story'
import { InewsIdParserImplementation } from './inews-id-parser-implementation'

describe(NsmlInewsStoryParser.name, () => {
  describe(NsmlInewsStoryParser.prototype.parseInewsStory.name, () => {
    describe('when fields with non-alphanumeric ids are present', () => {
      it('converts the field ids to camelCase', () => {
        const text: string = '<nsml version="some version 1.0"><head><storyid>001ea938:00ff8cf0:656994ba</storyid></head><story><fields><f id=title></f><f id=my-weird-key-name>some value</f></fields></story>'
        const testee: InewsStoryParser = createTestee()

        const result: InewsStory = testee.parseInewsStory(text, 'queue-id')

        expect(result.metadata).toHaveProperty('myWeirdKeyName')
        expect(result.metadata.myWeirdKeyName).toEqual('some value')
      })
    })

    describe('when story has anchored element references and text paragraphs', () => {
      it('merges anchored elements into the body paragraph order as cues', () => {
        const text: string = '<nsml version="some version 1.0"><head><storyid>001ea938:00ff8cf0:656994ba</storyid></head><story><fields><f id=title>Segment title</f></fields></fields><body><p><pi>KAM 1</pi></p><p><a idref=0></p><p><a idref=1></p></body><aeset><ae id=0><ap>Line1</ap><ap>Line2</ap></ae><ae id=1><ap>Line3</ap><ap>Line4</ap></ae></aeset></aeset></story>'
        const testee: InewsStoryParser = createTestee()
        const expectedInewsStory: InewsStory = {
          id: '001EA938',
          name: 'Segment title',
          queueId: 'queue-id',
          contentLocator: '00FF8CF0',
          versionLocator: '656994BA',
          metadata: {},
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

        const result: InewsStory = testee.parseInewsStory(text, 'queue-id')

        expect(result).toMatchObject(expectedInewsStory)
      })
    })

    describe('when story has no anchored elements but have anchored element references', () => {
      it('ignores the anchored element references', () => {
        const text: string = '<nsml version="some version 1.0"><head><storyid>001ea938:00ff8cf0:656994ba</storyid></head><story><fields><f id=title>Segment title</f></fields></fields><body><p><pi>KAM 1</pi></p><p><a idref=0></p></body></story>'
        const testee: InewsStoryParser = createTestee()
        const expectedCues: InewsCue[] = [
          {
            type: CueType.CONTENT,
            content: ['KAM 1'],
          },
        ]

        const result: InewsStory = testee.parseInewsStory(text, 'queue-id')

        expect(result.cues).toMatchObject(expectedCues)
      })
    })
  })
})

function createTestee(): InewsStoryParser {
  return new NsmlInewsStoryParser(new RegExpNsmlParser(), new InewsIdParserImplementation())
}
