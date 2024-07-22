import { NsmlAnchoredElement, NsmlDocument, NsmlParagraph, NsmlParagraphType } from '../value-objects/nsml-document'
import { decode } from 'html-entities'
import { NsmlParser } from '../interfaces/nsml-parser'

const HIDDEN_PARAGRAPH_PATTERN: RegExp = /]] S3.0 G 0 \[\[/

export class RegExpNsmlParser implements NsmlParser {
  public parseNsmlDocument(text: string): NsmlDocument {
    const version: string = this.parseNsmlVersion(text)
    const head: Readonly<Record<string, string>> = this.parseHead(text)
    const fields: Readonly<Record<string, string>> = this.parseFields(text)
    const body: readonly NsmlParagraph[] = this.parseBody(text)
    const anchoredElements: Readonly<Record<string, NsmlAnchoredElement>> = this.parseAnchoredElements(text)
    return {
      version,
      head,
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

  private parseHead(text: string): Readonly<Record<string, string>> {
    const headTagPattern: RegExp = /<head>\s*(?<content>.+)\s*<\/head>/is
    const headContent: string = headTagPattern.exec(text)?.groups?.content ?? ''

    const headFieldTagPattern: RegExp = /<(?<key>\w+)>\s*(?<value>.+?)\s*<\/\w+>/gis
    return Object.fromEntries(
      Array.from(
        headContent
          .replaceAll(/<(meta) (.*)>/g, '<$1 $2/>')
          .matchAll(headFieldTagPattern),
      )
        .map(match => match.groups as { key: string, value: string })
        .map(entry => [entry.key, entry.value]),
    )
  }

  private parseFields(text: string): Readonly<Record<string, string>> {
    const fieldTagPattern: RegExp = /<fields>\s*(?<content>.*)\s*<\/fields>/is
    const fieldsText: string = fieldTagPattern.exec(text)?.groups?.content ?? ''

    const fieldPattern: RegExp = /<f\s+id=(?<key>.+?)>(?<value>.*?)<\/f>/gis
    return Object.fromEntries(
      Array.from(fieldsText.matchAll(fieldPattern))
        .map(fieldMatch => fieldMatch.groups as { key: string, value: string })
        .map(field => [field.key, decode(field.value)]),
    )
  }

  private parseBody(text: string): readonly NsmlParagraph[] {
    const bodyTagPattern: RegExp = /<body>\s*(?<content>.+)<\/body>/is
    const bodyText: string = bodyTagPattern.exec(text)?.groups?.content ?? ''

    const paragraphTagPattern: RegExp = /<p>\s*(?<content>.*?)\s*<\/p>/gis
    return Array.from(bodyText.matchAll(paragraphTagPattern))
      .map(paragraphMatch => paragraphMatch.groups!.content!)
      .map(paragraphText => this.parseParagraph(paragraphText))
      .filter(paragraph => this.hasParagraphContent(paragraph))
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

    const cueId: string | undefined = paragraph.cueId?.trim()
    if (cueId) {
      return {
        type: NsmlParagraphType.CUE_REFERENCE,
        cueId,
      }
    }

    const manusText: string | undefined = paragraph.manusText?.trim()
    if (manusText) {
      return {
        type: NsmlParagraphType.MANUS,
        text: manusText,
      }
    }

    const comment: string = paragraph.comment?.trim() ?? paragraphText.trim()
    return {
      type: NsmlParagraphType.COMMENT,
      text: comment,
    }
  }

  private hasParagraphContent(paragraph: NsmlParagraph): boolean {
    return paragraph.type !== NsmlParagraphType.COMMENT || paragraph.text !== ''
  }

  private parseAnchoredElements(text: string): Readonly<Record<string, NsmlAnchoredElement>> {
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
    const anchoredElementParagraphPattern: RegExp = /<ap>(?<content>.*?)<\/ap>/gis
    return Array.from(anchoredElementText.matchAll(anchoredElementParagraphPattern))
      .map(match => match.groups!.content!)
      .filter(paragraph => !HIDDEN_PARAGRAPH_PATTERN.test(paragraph))
  }
}
