import { InewsId } from '../entities/inews-id'

export interface InewsIdParser {
  parseInewsId(text: string): InewsId
}
