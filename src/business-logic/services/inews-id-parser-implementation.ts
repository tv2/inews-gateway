import { InewsIdParser } from '../interfaces/inews-id-parser'
import { InewsId } from '../entities/inews-id'

export class InewsIdParserImplementation implements InewsIdParser {
  public parseInewsId(text: string): InewsId {
    const fragments: readonly string[] = text.trim().split(':')
    if (!this.hasThreeFragments(fragments)) {
      throw new Error('Expected iNews id to have the format "<storyId>:<contentLocator>:<versionLocator>".')
    }
    return {
      storyId: fragments[0].toUpperCase(),
      contentLocator: fragments[1].toUpperCase(),
      versionLocator: fragments[2].toUpperCase(),
    }
  }

  private hasThreeFragments(fragments: readonly string[]): fragments is readonly [string, string, string] {
    return fragments.filter(fragment => fragment).length === 3
  }
}
