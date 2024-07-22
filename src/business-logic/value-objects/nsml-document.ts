// The data structure models Avid NSML version 1.0

export interface NsmlDocument {
  readonly version: string
  readonly head: NsmlHead
  readonly fields: NsmlFields
  readonly body: readonly NsmlParagraph[]
  readonly anchoredElements: Readonly<Record<string, NsmlAnchoredElement>>
}

export interface NsmlHead {
  readonly storyid: string
  readonly [key: string]: string
}

export interface NsmlFields {
  readonly title: string
  readonly [key: string]: string
}

export type NsmlParagraph =
  | NsmlTextParagraph
  | NsmlCommentParagraph
  | NsmlManusParagraph
  | NsmlAnchoredElementParagraph

export interface NsmlTextParagraph {
  readonly type: NsmlParagraphType.TEXT
  readonly text: string
}

export interface NsmlCommentParagraph {
  readonly type: NsmlParagraphType.COMMENT
  readonly text: string
}

export interface NsmlManusParagraph {
  readonly type: NsmlParagraphType.MANUS
  readonly text: string
}

export interface NsmlAnchoredElementParagraph {
  readonly type: NsmlParagraphType.CUE_REFERENCE
  readonly cueId: string
}

export enum NsmlParagraphType {
  CUE_REFERENCE = 'CUE_REFERENCE',
  COMMENT = 'COMMENT',
  MANUS = 'MANUS',
  TEXT = 'TEXT',
}

export type NsmlAnchoredElement = readonly string[]
