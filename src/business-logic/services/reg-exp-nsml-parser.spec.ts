import { RegExpNsmlParser } from './reg-exp-nsml-parser'
import { NsmlParser } from '../interfaces/nsml-parser'
import { NsmlDocument, NsmlHead, NsmlParagraphType } from '../value-objects/nsml-document'

describe(RegExpNsmlParser.name, () => {
  describe('when nsml document has no anchored elements', () => {
    it('returns document with empty anchored elements list', () => {
      const text: string = '<nsml version="some version 1.0"><head><storyid>storyid</storyid></head><story><fields><f id=title></f></fields><body><p><cc>Some comment</cc></p><p><pi>Camera 1</pi></pi></p></body></story>'
      const testee: NsmlParser = createTestee()

      const result: NsmlDocument = testee.parseNsmlDocument(text)

      expect(Object.keys(result.anchoredElements).length).toBe(0)
    })
  })

  describe('when nsml document has no head tag', () => {
    it('throws an error', () => {
      const text: string = '<nsml version="some version 1.0"><story><fields></fields><body><p><cc>Some comment</cc></p><p><pi>Camera 1</pi></pi></p></body></story>'
      const testee: NsmlParser = createTestee()

      const result: () => NsmlDocument = () => testee.parseNsmlDocument(text)

      expect(result).toThrow()
    })
  })

  describe('when a valid NSML document is given', () => {
    it('returns the extracted information', () => {
      const nsmlVersion: string = 'somer version 1.0'
      const storyId: string = '001ea938:00ff8cf0:656994ba'
      const title: string = 'Some story name'
      const text: string = `<nsml version="${nsmlVersion}"><head><storyid>${storyId}</storyid></head><story><fields><f id=title>${title}</f></fields><body><p><a idref=0></p><p><cc>Comment</cc></p><p><pi>KAM 1</pi></p><p>MANUS</p></body><aeset><ae id=0><ap>First line=Foo</ap><ap>Second line = BAR</ap></ae></aeset></story>`
      const testee: NsmlParser = createTestee()
      const expectedNsmlDocument: NsmlDocument = {
        version: nsmlVersion,
        head: { storyid: storyId },
        fields: { title },
        body: [
          {
            type: NsmlParagraphType.CUE_REFERENCE, cueId: '0' },
          {
            type: NsmlParagraphType.COMMENT,
            text: 'Comment',
          },
          {
            type: NsmlParagraphType.TEXT,
            text: 'KAM 1',
          },
          {
            type: NsmlParagraphType.MANUS,
            text: 'MANUS',
          },
        ],
        anchoredElements: {
          0: ['First line=Foo', 'Second line = BAR'],
        },
      }

      const result: NsmlDocument = testee.parseNsmlDocument(text)

      expect(result).toMatchObject(expectedNsmlDocument)
    })
  })

  describe('when meta tag under head tag has attributes', () => {
    it('returns the attributes as tag under head', () => {
      const text: string = '<nsml version="some version 1.0"><head><meta rate=150 float wire mail><storyid>some:story:id</storyid></head><story><fields><f id=title>title</f></fields><body><p><a idref=0></p><p><cc>Comment</cc></p><p><pi>KAM 1</pi></p><p>MANUS</p></body><aeset><ae id=0><ap>First line=Foo</ap><ap>Second line = BAR</ap></ae></aeset></story>'
      const testee: NsmlParser = createTestee()
      const expectedHead: NsmlHead = {
        storyid: 'some:story:id',
        rate: '150',
        float: 'float',
        wire: 'wire',
        mail: 'mail',
      }

      const result: NsmlDocument = testee.parseNsmlDocument(text)

      expect(result.head).toMatchObject(expectedHead)
    })
  })
})

function createTestee(): NsmlParser {
  return new RegExpNsmlParser()
}
