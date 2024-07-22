import { InewsStoryParser } from '../interfaces/inews-story-parser'
import { CueType, InewsCue, InewsStory } from '../entities/inews-story'
import { NsmlAnchoredElement, NsmlParagraph, NsmlParagraphType } from '../value-objects/nsml-document'
import { NsmlParser } from './nsml-parser'

export class NsmlInewsStoryParser implements InewsStoryParser {
  public parseInewsStory(text: string, queueId: string, storyId: string): InewsStory {
    const nsmlParser = new NsmlParser()
    const nsmlDocument = nsmlParser.parseNsmlDocument(text)
    return {
      id: storyId,
      queueId,
      name: nsmlDocument.fields.title ?? 'Unnamed story',
      metadata: nsmlDocument.fields,
      cues: this.mergeIntoCues(nsmlDocument.body, nsmlDocument.anchoredElements)
    }
  }

  private mergeIntoCues(paragraphs: readonly NsmlParagraph[], cues: Readonly<Record<string, NsmlAnchoredElement>>): InewsCue[] {
    return paragraphs.map((paragraph) => {
      switch (paragraph.type) {
        case NsmlParagraphType.TEXT:
          return {
            type: CueType.CONTENT,
            content: [paragraph.text],
          }
        case NsmlParagraphType.COMMENT:
          return {
            type: CueType.COMMENT,
            content: [paragraph.text],
          }
        case NsmlParagraphType.MANUS:
          return {
            type: CueType.MANUS,
            content: [paragraph.text],
          }
        case NsmlParagraphType.CUE_REFERENCE:
          return {
            type: CueType.CONTENT,
            content: cues[paragraph.cueId] ?? [],
          }
        case NsmlParagraphType.INVALID:
          return {
            type: CueType.INVALID,
            content: [paragraph.text],
          }
      }
    })
  }
}
