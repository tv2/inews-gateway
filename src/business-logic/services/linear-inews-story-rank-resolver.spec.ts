import { LinearInewsStoryRankResolver } from './linear-inews-story-rank-resolver'
import { InewsStoryRankResolver } from '../interfaces/inews-story-rank-resolver'
import { EntityTestFactory } from '../factories/entity-test-factory'
import { InewsStory } from '../entities/inews-story'
import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'

describe(LinearInewsStoryRankResolver.name, () => {
  describe(LinearInewsStoryRankResolver.prototype.getInewsStoryRanks.name, () => {
    describe('when no stories are cached', () => {
      it('assigns every-increasing unique ranks matching the order of the given sequence', () => {
        const testee: InewsStoryRankResolver = createTestee()
        const inewsStoryMetadataSequence: readonly InewsStoryMetadata[] = Array(10_000).fill(null).map((_, index): InewsStoryMetadata => EntityTestFactory.createInewsStoryMetadata({ id: `story-${index}` }))
        const cachedStories: ReadonlyMap<string, InewsStory> = new Map()

        const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryMetadataSequence, cachedStories)

        expect(getRankSortedInewsStoryIds(inewsStoryMetadataSequence, result)).toMatchObject(inewsStoryMetadataSequence.map(inewsStoryMetadata => inewsStoryMetadata.id))
        expect(result.size).toBe(new Set(result.values()).size)
      })
    })

    describe('when some stories are cached', () => {
      describe('when the uncached stories are in between cached stories', () => {
        it('assigns every-increasing unique ranks matching the order of the given sequence', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-a' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-b' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-c' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-d' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-e' }),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryMetadataSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[0], rank: 2000 })],
            [inewsStoryMetadataSequence[4].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[4], rank: 4000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryMetadataSequence, cachedStories)

          expect(getRankSortedInewsStoryIds(inewsStoryMetadataSequence, result)).toMatchObject(inewsStoryMetadataSequence.map(inewsStoryMetadata => inewsStoryMetadata.id))
          expect(result.size).toBe(new Set(result.values()).size)
        })
      })

      describe('when the uncached stories are at the start of the story sequence', () => {
        it('assigns every-increasing unique ranks matching the order of the given sequence', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-a' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-b' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-c' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-d' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-e' }),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryMetadataSequence[3].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[3], rank: 2000 })],
            [inewsStoryMetadataSequence[4].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[4], rank: 6000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryMetadataSequence, cachedStories)

          expect(getRankSortedInewsStoryIds(inewsStoryMetadataSequence, result)).toMatchObject(inewsStoryMetadataSequence.map(inewsStoryMetadata => inewsStoryMetadata.id))
          expect(result.size).toBe(new Set(result.values()).size)
        })
      })

      describe('when the uncached stories are at the end of the story sequence', () => {
        it('assigns every-increasing unique ranks matching the order of the given sequence', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-a' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-b' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-c' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-d' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-e' }),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryMetadataSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[0], rank: 2000 })],
            [inewsStoryMetadataSequence[1].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[1], rank: 6000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryMetadataSequence, cachedStories)

          expect(getRankSortedInewsStoryIds(inewsStoryMetadataSequence, result)).toMatchObject(inewsStoryMetadataSequence.map(inewsStoryMetadata => inewsStoryMetadata.id))
          expect(result.size).toBe(new Set(result.values()).size)
        })
      })

      describe('when the highest ranked cached stories is moved into the middle of story sequence', () => {
        it('assigns every-increasing unique ranks matching the order of the given sequence', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-a' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-b' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-c' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-d' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-e' }),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryMetadataSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[0], rank: 1000 })],
            [inewsStoryMetadataSequence[1].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[1], rank: 2000 })],
            [inewsStoryMetadataSequence[2].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[2], rank: 5000, versionLocator: 'newVersion' })],
            [inewsStoryMetadataSequence[3].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[3], rank: 3000 })],
            [inewsStoryMetadataSequence[4].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[4], rank: 4000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryMetadataSequence, cachedStories)

          expect(getRankSortedInewsStoryIds(inewsStoryMetadataSequence, result)).toMatchObject(inewsStoryMetadataSequence.map(inewsStoryMetadata => inewsStoryMetadata.id))
          expect(result.size).toBe(new Set(result.values()).size)
        })
      })

      describe('when multiple high-ranked stories are moved into the middle of the story sequence', () => {
        it('assigns every-increasing unique ranks matching the order of the given sequence', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-a' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-b' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-c' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-d' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-e' }),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryMetadataSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[0], rank: 1000 })],
            [inewsStoryMetadataSequence[1].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[1], rank: 4000, versionLocator: 'newVersion' })],
            [inewsStoryMetadataSequence[2].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[2], rank: 5000, versionLocator: 'newVersion' })],
            [inewsStoryMetadataSequence[3].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[3], rank: 2000 })],
            [inewsStoryMetadataSequence[4].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[4], rank: 3000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryMetadataSequence, cachedStories)

          expect(getRankSortedInewsStoryIds(inewsStoryMetadataSequence, result)).toMatchObject(inewsStoryMetadataSequence.map(inewsStoryMetadata => inewsStoryMetadata.id))
          expect(result.size).toBe(new Set(result.values()).size)
        })
      })

      describe('when the lowest ranked cached stories is moved into the middle of story sequence', () => {
        it('assigns every-increasing unique ranks matching the order of the given sequence', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-a' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-b' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-c' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-d' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-e' }),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryMetadataSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[0], rank: 2000 })],
            [inewsStoryMetadataSequence[1].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[1], rank: 3000 })],
            [inewsStoryMetadataSequence[2].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[2], rank: 1000, versionLocator: 'newVersion' })],
            [inewsStoryMetadataSequence[3].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[3], rank: 4000 })],
            [inewsStoryMetadataSequence[4].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[4], rank: 5000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryMetadataSequence, cachedStories)

          expect(getRankSortedInewsStoryIds(inewsStoryMetadataSequence, result)).toMatchObject(inewsStoryMetadataSequence.map(inewsStoryMetadata => inewsStoryMetadata.id))
          expect(result.size).toBe(new Set(result.values()).size)
        })
      })

      describe('when multiple low-ranked stories are moved into the middle of the story sequence', () => {
        it('assigns every-increasing unique ranks matching the order of the given sequence', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-a' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-b' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-c' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-d' }),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-e' }),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryMetadataSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[0], rank: 3000 })],
            [inewsStoryMetadataSequence[1].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[1], rank: 1000, versionLocator: 'newVersion' })],
            [inewsStoryMetadataSequence[2].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[2], rank: 2000, versionLocator: 'newVersion' })],
            [inewsStoryMetadataSequence[3].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[3], rank: 4000 })],
            [inewsStoryMetadataSequence[4].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[4], rank: 5000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryMetadataSequence, cachedStories)

          expect(getRankSortedInewsStoryIds(inewsStoryMetadataSequence, result)).toMatchObject(inewsStoryMetadataSequence.map(inewsStoryMetadata => inewsStoryMetadata.id))
          expect(result.size).toBe(new Set(result.values()).size)
        })
      })

      describe('when more stories are created, change or moved than there are available ranks', () => {
        it('assigns every-increasing unique ranks matching the order of the given sequence', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryMetadataSequence: readonly InewsStoryMetadata[] = [
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-a' }),
            ...Array(10_000).fill(null).map((_, index): InewsStoryMetadata => EntityTestFactory.createInewsStoryMetadata({ id: `story-${index}` })),
            EntityTestFactory.createInewsStoryMetadata({ id: 'story-b' }),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryMetadataSequence[0]!.id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[0]!, rank: 1000 })],
            [inewsStoryMetadataSequence[10_001]!.id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[10_001]!, rank: 1100 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryMetadataSequence, cachedStories)

          expect(getRankSortedInewsStoryIds(inewsStoryMetadataSequence, result)).toMatchObject(inewsStoryMetadataSequence.map(inewsStoryMetadata => inewsStoryMetadata.id))
          expect(new Set(result.values()).size).toBe(inewsStoryMetadataSequence.length)
        })
      })
    })

    describe('when the number of created, changed and moved stories is lesser than the available ranks', () => {
      it('does not alter the rank of untouched segments', () => {
        const testee: InewsStoryRankResolver = createTestee()
        const inewsStoryMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
          EntityTestFactory.createInewsStoryMetadata({ id: 'story-a' }),
          EntityTestFactory.createInewsStoryMetadata({ id: 'story-b' }),
          EntityTestFactory.createInewsStoryMetadata({ id: 'story-c' }),
          EntityTestFactory.createInewsStoryMetadata({ id: 'story-d' }),
        ]
        const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
          [inewsStoryMetadataSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[0], rank: 1000 })],
          [inewsStoryMetadataSequence[2].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[2], rank: 7500 })],
          [inewsStoryMetadataSequence[3].id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[3], rank: 14000 })],
        ])

        const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryMetadataSequence, cachedStories)

        expect(getRankSortedInewsStoryIds(inewsStoryMetadataSequence, result)).toMatchObject(inewsStoryMetadataSequence.map(inewsStoryMetadata => inewsStoryMetadata.id))
        expect(result.get(inewsStoryMetadataSequence[0].id)).toBe(1000)
        expect(result.get(inewsStoryMetadataSequence[2].id)).toBe(7500)
        expect(result.get(inewsStoryMetadataSequence[3].id)).toBe(14000)
      })
    })

    describe('when the rank sequence have a high density', () => {
      it('resolves the ranks for all stories as if it was the first resolution iteration', () => {
        const testee: InewsStoryRankResolver = createTestee()
        const inewsStoryMetadataSequence: readonly InewsStoryMetadata[] = [
          EntityTestFactory.createInewsStoryMetadata({ id: 'story-a' }),
          ...Array(100).fill(null).map((_, index) => EntityTestFactory.createInewsStoryMetadata({ id: `story-${index}` })),
          EntityTestFactory.createInewsStoryMetadata({ id: 'story-b' }),
          EntityTestFactory.createInewsStoryMetadata({ id: 'story-c' }),
          EntityTestFactory.createInewsStoryMetadata({ id: 'story-d' }),
        ]
        const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
          [inewsStoryMetadataSequence[0]!.id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[0], rank: 100 })],
          [inewsStoryMetadataSequence[101]!.id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[101], rank: 300 })],
          [inewsStoryMetadataSequence[102]!.id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[102], rank: 400 })],
          [inewsStoryMetadataSequence[103]!.id, EntityTestFactory.createInewsStory({ ...inewsStoryMetadataSequence[103], rank: 500 })],
        ])

        const resultWithoutCache: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryMetadataSequence, new Map())
        const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryMetadataSequence, cachedStories)

        result.forEach((rank, storyId) => expect([storyId, rank]).toMatchObject([storyId, resultWithoutCache.get(storyId)]))
      })
    })
  })
})

function createTestee(): InewsStoryRankResolver {
  return new LinearInewsStoryRankResolver()
}

function getRankSortedInewsStoryIds(inewsStoryMetadataSequence: readonly InewsStoryMetadata[], storyRankMap: ReadonlyMap<string, number>): readonly string[] {
  return inewsStoryMetadataSequence
    .map(inewsStoryMetadata => [inewsStoryMetadata.id, storyRankMap.get(inewsStoryMetadata.id)] as [string, number | undefined])
    .filter((storyIdAndRank): storyIdAndRank is [string, number] => storyIdAndRank[1] !== undefined)
    .sort((a: [string, number], b: [string, number]) => a[1] - b[1])
    .map(([storyId]) => storyId)
}
