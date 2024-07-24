import { InewsStory } from '../entities/inews-story'
import { InewsStoryRankResolver } from '../interfaces/inews-story-rank-resolver'
import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'

export type RankEntry = readonly [string, number]

const RANK_STEP_SIZE: number = 1000

export class InewsStoryRankResolverImplementation implements InewsStoryRankResolver {
  public getInewsStoryRanks(
    storyIds: readonly InewsStoryMetadata[],
    cachedStories: ReadonlyMap<string, InewsStory>,
  ): ReadonlyMap<string, number> {
    return new Map(this.getCachedRanks(storyIds, cachedStories).reduce(this.updateRankReducer.bind(this), []))
  }

  private getCachedRanks(inewsStoryMetadataSequence: readonly InewsStoryMetadata[], cachedStories: ReadonlyMap<string, InewsStory>): readonly RankEntry[] {
    return inewsStoryMetadataSequence.map(inewsStoryMetadata => [inewsStoryMetadata.id, this.getCachedRank(inewsStoryMetadata, cachedStories)])
  }

  private getCachedRank(inewsStoryMetadata: InewsStoryMetadata, cachedStories: ReadonlyMap<string, InewsStory>): number {
    const storyId: string = inewsStoryMetadata.id
    const cachedInewsStory: InewsStory | undefined = cachedStories.get(storyId)
    if (!cachedInewsStory || cachedInewsStory.versionLocator !== inewsStoryMetadata.versionLocator) {
      return 0
    }
    return cachedInewsStory.rank
  }

  private updateRankReducer(
    updatedRanks: readonly RankEntry[],
    [storyId, cachedRank]: RankEntry,
    index: number,
    cachedRanks: readonly RankEntry[],
  ): readonly RankEntry[] {
    return [
      ...updatedRanks,
      [storyId, this.getUpdatedRank(cachedRank, index, updatedRanks, cachedRanks)],
    ]
  }

  private getUpdatedRank(
    cachedRank: number,
    index: number,
    updatedRanks: readonly RankEntry[],
    cachedRanks: readonly RankEntry[],
  ): number {
    const previousRank: number = updatedRanks[index - 1]?.[1] ?? 0
    const nextRank: number | undefined = this.getNextRankLargerThanPreviousRank(cachedRanks, index, previousRank)

    if (cachedRank <= previousRank) {
      return this.getRankInBetween(previousRank, nextRank)
    }

    if (nextRank && cachedRank >= nextRank) {
      return this.getRankInBetween(previousRank, nextRank)
    }

    return cachedRank
  }

  private getNextRankLargerThanPreviousRank(cachedRanks: readonly RankEntry[], index: number, previousRank: number): number | undefined {
    return cachedRanks
      .slice(index + 1)
      .find(([, cachedNextRank]) => cachedNextRank > previousRank)?.[1]
  }

  private getRankInBetween(previousRank: number, maybeNextRank?: number): number {
    const nextRank = maybeNextRank ?? previousRank + 2 * RANK_STEP_SIZE
    return previousRank + (nextRank - previousRank) / 2
  }
}
