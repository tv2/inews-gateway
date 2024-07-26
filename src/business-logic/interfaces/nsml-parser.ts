import { NsmlDocument } from '../value-objects/nsml-document'

export interface NsmlParser {
  parseNsmlDocument(text: string): NsmlDocument
}
