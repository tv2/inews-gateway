import { InewsStoryParser } from '../interfaces/inews-story-parser'
import { CueType, InewsCue, InewsStory } from '../entities/inews-story'
import { NsmlAnchoredElement, NsmlDocument, NsmlParagraph, NsmlParagraphType } from '../value-objects/nsml-document'
import { NsmlParser } from '../interfaces/nsml-parser'

export class NsmlInewsStoryParser implements InewsStoryParser {
  public constructor(private readonly nsmlParser: NsmlParser) {}

  public parseInewsStory(text: string, queueId: string): InewsStory {
    const nsmlDocument = this.nsmlParser.parseNsmlDocument(text)
    return {
      id: nsmlDocument.head.storyid.split(':')[0]!,
      name: nsmlDocument.fields.title,
      queueId,
      locator: this.getStoryLocator(nsmlDocument),
      metadata: this.formatMetadata(nsmlDocument.fields),
      cues: this.mergeIntoCues(nsmlDocument.body, nsmlDocument.anchoredElements),
    }
  }

  private formatMetadata(record: Record<string, string>): Record<string, string> {
    return Object.fromEntries(
      Object.entries(record)
        .filter(([, value]) => value)
        .map(([key, value]) => [this.formatAsCamelCase(key), value]),
    )
  }

  private formatAsCamelCase(text: string): string {
    const fragments: string[] = text.split(/[-_. ]/g)
    const capitalizedFragments: string[] = fragments.slice(1).map(fragment => this.capitalize(fragment))
    return `${fragments[0]}${capitalizedFragments.join('')}`
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
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
      }
    })
      .filter(cue => cue.content.length > 0)
  }

  private getStoryLocator(nsmlDocument: NsmlDocument): string {
    return nsmlDocument.head.storyid.split(':').slice(1).join(':')
  }
}
