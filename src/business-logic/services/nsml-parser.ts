import { NsmlAnchoredElement, NsmlDocument, NsmlParagraph, NsmlParagraphType } from '../value-objects/nsml-document'
import { decode } from 'html-entities'

export class NsmlParser {
  public parseNsmlDocument(text: string): NsmlDocument {
    const version: string = this.parseNsmlVersion(text)
    const storyId: string = this.parseStoryId(text)
    const fields: Record<string, string> = this.parseFields(text)
    const body: NsmlParagraph[] = this.parseBody(text)
    const anchoredElements: Record<string, NsmlAnchoredElement> = this.parseAnchoredElements(text)
    return {
      version,
      head: { storyId },
      fields,
      body,
      anchoredElements,
    }
  }

  private parseNsmlVersion(text: string): string {
    const nsmlTagPattern: RegExp = /<nsml\s+version="(?<version>[^"]+)"\s*>/is
    const match: { version: string } | undefined = nsmlTagPattern.exec(text)?.groups as { version: string } | undefined
    if (!match) {
      throw new Error('Failed to find NSML tag with version attribute.')
    }
    return match.version
  }

  private parseStoryId(text: string): string {
    const headTagPattern: RegExp = /<head>\s*(?<content>.+)\s*<\/head>/is
    const headContent: string = headTagPattern.exec(text)?.groups?.content ?? ''
    if (!headContent) {
      throw new Error('Expected head tag.')
    }

    const storyIdPattern: RegExp = /<storyid>(?<id>.+)<\/storyid>/is
    const storyId: string = storyIdPattern.exec(text)?.groups?.id ?? ''
    if (!storyId) {
      throw new Error('Expected storyid tag in head tag.')
    }
    return storyId
  }

  private parseFields(text: string): Record<string, string> {
    const fieldTagPattern: RegExp = /<fields>\s*(?<content>.*)\s*<\/fields>/is
    const fieldsText: string = fieldTagPattern.exec(text)?.groups?.content ?? ''

    const fieldPattern: RegExp = /<f\s+id=(?<key>.+?)>(?<value>.*?)<\/f>/gis
    return Object.fromEntries(
      Array.from(fieldsText.matchAll(fieldPattern))
        .map(fieldMatch => fieldMatch.groups as { key: string, value: string })
        .map(field => [field.key, decode(field.value)]),
    )
  }

  private parseBody(text: string): NsmlParagraph[] {
    const bodyTagPattern: RegExp = /<body>\s*(?<content>.+)<\/body>/is
    const bodyText: string = bodyTagPattern.exec(text)?.groups?.content ?? ''

    const paragraphTagPattern: RegExp = /<paragraph>\s*(?<content>.*?)<\/paragraph>/gis
    return Array.from(bodyText.matchAll(paragraphTagPattern))
      .map(paragraphMatch => paragraphMatch.groups!.content!)
      .map(paragraphText => this.parseParagraph(paragraphText))
  }

  private parseParagraph(paragraphText: string): NsmlParagraph {
    const paragraphPattern: RegExp = /(<pi>(?<cueText>.*?)<\/pi>)|(<cc>(?<comment>.*?)<\/cc>)|(<a idref=(?<cueId>\d+)>)|(?<manusText>.+)/gis
    const paragraph: { cueText?: string, comment?: string, cueId?: string, manusText?: string } = paragraphPattern.exec(paragraphText)?.groups ?? {}
    const cueText: string | undefined = paragraph.cueText?.trim()
    if (cueText) {
      return {
        type: NsmlParagraphType.TEXT,
        text: cueText,
      }
    }

    const comment: string | undefined = paragraph.comment?.trim()
    if (comment) {
      return {
        type: NsmlParagraphType.COMMENT,
        text: comment,
      }
    }

    const manusText: string | undefined = paragraph.manusText?.trim()
    if (manusText) {
      return {
        type: NsmlParagraphType.MANUS,
        text: manusText,
      }
    }

    return {
      type: NsmlParagraphType.INVALID,
      text: paragraphText,
    }
  }

  private parseAnchoredElements(text: string): Record<string, NsmlAnchoredElement> {
    const anchoredElementSetTagPattern: RegExp = /<aeset>\s*(?<content>.*?)\s*<\/aeset>/is
    const anchoredElementSetText: string = anchoredElementSetTagPattern.exec(text)?.groups?.content ?? ''

    const anchoredElementTagPattern: RegExp = /<ae id=(?<id>.+?)>(?<content>.*?)<\/ae>/gis
    return Object.fromEntries(
      Array.from(anchoredElementSetText.matchAll(anchoredElementTagPattern))
        .map(anchoredElementTagMatch => anchoredElementTagMatch.groups! as { id: string, content: string })
        .map(anchoredElement => [anchoredElement.id, this.parseAnchoredElement(anchoredElement.content)]),
    )
  }

  private parseAnchoredElement(anchoredElementText: string): NsmlAnchoredElement {
    const anchoredElementParagraphPattern: RegExp = /<ap>(<?content>.*?)<\/ap>/gis
    return Array.from(anchoredElementText.matchAll(anchoredElementParagraphPattern))
      .map(match => match.groups!.content!)
      .filter(paragraph => paragraph !== ']] S3.0 G 0 [[')
  }
}
