import { InewsStory } from '../entities/inews-story'
import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'

export interface InewsStoryRankResolver {
  getInewsStoryRanks(inewsStoryMetadataSequence: readonly InewsStoryMetadata[], cachedStories: ReadonlyMap<string, InewsStory>): ReadonlyMap<string, number>
}
