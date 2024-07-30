import { InewsStory } from '../entities/inews-story'
import { InewsStoryRankResolver } from '../interfaces/inews-story-rank-resolver'
import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'

type RankEntry = readonly [string, number]

const RANK_STEP_SIZE: number = 10

export class LogarithmicInewsStoryRankResolver implements InewsStoryRankResolver {
  public getInewsStoryRanks(inewsStoryMetadata: readonly InewsStoryMetadata[], cachedStories: ReadonlyMap<string, InewsStory>): ReadonlyMap<string, number> {
    return new Map(this.getCachedRanks(inewsStoryMetadata, cachedStories).reduce(this.updateRankReducer.bind(this), []))
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

  private updateRankReducer(updatedRanks: readonly RankEntry[], [storyId, cachedRank]: RankEntry, index: number, cachedRanks: readonly RankEntry[]): readonly RankEntry[] {
    return [
      ...updatedRanks,
      [storyId, this.getUpdatedRank(cachedRank, index, updatedRanks, cachedRanks)],
    ]
  }

  private getUpdatedRank(cachedRank: number, index: number, updatedRanks: readonly RankEntry[], cachedRanks: readonly RankEntry[]): number {
    const previousRankIndex: number = index - 1
    const previousRank: number = updatedRanks[previousRankIndex]?.[1] ?? 0
    const nextRankAndIndex: { rank: number, index: number } | undefined = this.getIndexAndRankForNextRankLargerThanPreviousRank(cachedRanks, index, previousRank)
    const nextRank: number | undefined = nextRankAndIndex?.rank
    const stepResolution: number = nextRankAndIndex ? nextRankAndIndex.index - previousRankIndex : 2

    if (cachedRank <= previousRank) {
      return this.getRankInBetween(previousRank, nextRank, stepResolution)
    }

    if (nextRank && cachedRank >= nextRank) {
      return this.getRankInBetween(previousRank, nextRank, stepResolution)
    }

    return cachedRank
  }

  private getIndexAndRankForNextRankLargerThanPreviousRank(cachedRankEntries: readonly RankEntry[], index: number, previousRank: number): { rank: number, index: number } | undefined {
    const startIndex: number = index + 1
    const nextRankIndex: number = startIndex + cachedRankEntries.slice(startIndex).findIndex(([, cachedNextRank]: RankEntry) => cachedNextRank > previousRank)
    if (nextRankIndex < startIndex) {
      return
    }
    const nextRankEntry: RankEntry = cachedRankEntries[nextRankIndex]!
    return {
      index: nextRankIndex,
      rank: nextRankEntry[1],
    }
  }

  private getRankInBetween(previousRank: number, maybeNextRank: number | undefined, resolution: number): number {
    const nextRank: number = maybeNextRank ?? previousRank + resolution * RANK_STEP_SIZE
    const rankIncreaseFromPrevious: number = Math.floor((nextRank - previousRank) / resolution)
    return previousRank + Math.max(1, rankIncreaseFromPrevious)
  }
}
