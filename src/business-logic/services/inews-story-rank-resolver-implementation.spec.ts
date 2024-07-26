import { InewsStoryRankResolverImplementation } from './inews-story-rank-resolver-implementation'
import { InewsStoryRankResolver } from '../interfaces/inews-story-rank-resolver'
import { EntityTestFactory } from '../factories/entity-test-factory'
import { InewsStory } from '../entities/inews-story'
import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'

describe(InewsStoryRankResolverImplementation.name, () => {
  describe(InewsStoryRankResolverImplementation.prototype.getInewsStoryRanks.name, () => {
    describe('when no stories are cached', () => {
      it('assigns ranks linear', () => {
        const testee: InewsStoryRankResolver = createTestee()
        const inewsStoryIdSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
          EntityTestFactory.createInewsStoryMetadata(),
          EntityTestFactory.createInewsStoryMetadata(),
          EntityTestFactory.createInewsStoryMetadata(),
        ]
        const cachedStories: ReadonlyMap<string, InewsStory> = new Map()

        const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryIdSequence, cachedStories)

        expect(Array.from(result.entries())).toMatchObject([
          [inewsStoryIdSequence[0].id, 1000],
          [inewsStoryIdSequence[1].id, 2000],
          [inewsStoryIdSequence[2].id, 3000],
        ])
      })
    })

    describe('when some stories are cached', () => {
      describe('when the uncached stories are in between cached stories', () => {
        it('fits in the uncached stories in between the cached stories', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryIdSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryIdSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[0], rank: 2000 })],
            [inewsStoryIdSequence[4].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[4], rank: 4000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryIdSequence, cachedStories)

          expect(Array.from(result.entries())).toMatchObject([
            [inewsStoryIdSequence[0].id, 2000],
            [inewsStoryIdSequence[1].id, 3000],
            [inewsStoryIdSequence[2].id, 3500],
            [inewsStoryIdSequence[3].id, 3750],
            [inewsStoryIdSequence[4].id, 4000],
          ])
        })
      })

      describe('when the uncached stories are at the start of the story sequence', () => {
        it('fits the uncached stories in between rank 0 and the rank of the first cached story', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryIdSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryIdSequence[3].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[3], rank: 2000 })],
            [inewsStoryIdSequence[4].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[4], rank: 6000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryIdSequence, cachedStories)

          expect(Array.from(result.entries())).toMatchObject([
            [inewsStoryIdSequence[0].id, 1000],
            [inewsStoryIdSequence[1].id, 1500],
            [inewsStoryIdSequence[2].id, 1750],
            [inewsStoryIdSequence[3].id, 2000],
            [inewsStoryIdSequence[4].id, 6000],
          ])
        })
      })

      describe('when the uncached stories are at the end of the story sequence', () => {
        it('the uncached stories are assigned ranks linearly increasing from the rank of the highest ranked cached story', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryIdSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryIdSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[0], rank: 2000 })],
            [inewsStoryIdSequence[1].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[1], rank: 6000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryIdSequence, cachedStories)

          expect(Array.from(result.entries())).toMatchObject([
            [inewsStoryIdSequence[0].id, 2000],
            [inewsStoryIdSequence[1].id, 6000],
            [inewsStoryIdSequence[2].id, 7000],
            [inewsStoryIdSequence[3].id, 8000],
            [inewsStoryIdSequence[4].id, 9000],
          ])
        })
      })

      describe('when the highest ranked cached stories is moved into the middle of story sequence', () => {
        it('the highest ranked story is given a new rank in between the ranks of the stories that it was placed in between', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryIdSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryIdSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[0], rank: 1000 })],
            [inewsStoryIdSequence[1].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[1], rank: 2000 })],
            [inewsStoryIdSequence[2].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[2], rank: 5000, versionLocator: 'newVersion' })],
            [inewsStoryIdSequence[3].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[3], rank: 3000 })],
            [inewsStoryIdSequence[4].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[4], rank: 4000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryIdSequence, cachedStories)

          expect(Array.from(result.entries())).toMatchObject([
            [inewsStoryIdSequence[0].id, 1000],
            [inewsStoryIdSequence[1].id, 2000],
            [inewsStoryIdSequence[2].id, 2500],
            [inewsStoryIdSequence[3].id, 3000],
            [inewsStoryIdSequence[4].id, 4000],
          ])
        })
      })

      describe('when multiple high-ranked stories are moved into the middle of the story sequence', () => {
        it('fits the high-ranked stories ranks in between the surround stories ranks', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryIdSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryIdSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[0], rank: 1000 })],
            [inewsStoryIdSequence[1].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[1], rank: 4000, versionLocator: 'newVersion' })],
            [inewsStoryIdSequence[2].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[2], rank: 5000, versionLocator: 'newVersion' })],
            [inewsStoryIdSequence[3].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[3], rank: 2000 })],
            [inewsStoryIdSequence[4].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[4], rank: 3000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryIdSequence, cachedStories)

          expect(Array.from(result.entries())).toMatchObject([
            [inewsStoryIdSequence[0].id, 1000],
            [inewsStoryIdSequence[1].id, 1500],
            [inewsStoryIdSequence[2].id, 1750],
            [inewsStoryIdSequence[3].id, 2000],
            [inewsStoryIdSequence[4].id, 3000],
          ])
        })
      })

      describe('when the lowest ranked cached stories is moved into the middle of story sequence', () => {
        it('the lowest ranked story is given a new rank in between the ranks of the stories that it was placed in between', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryIdSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryIdSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[0], rank: 2000 })],
            [inewsStoryIdSequence[1].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[1], rank: 3000 })],
            [inewsStoryIdSequence[2].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[2], rank: 1000, versionLocator: 'newVersion' })],
            [inewsStoryIdSequence[3].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[3], rank: 4000 })],
            [inewsStoryIdSequence[4].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[4], rank: 5000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryIdSequence, cachedStories)

          expect(Array.from(result.entries())).toMatchObject([
            [inewsStoryIdSequence[0].id, 2000],
            [inewsStoryIdSequence[1].id, 3000],
            [inewsStoryIdSequence[2].id, 3500],
            [inewsStoryIdSequence[3].id, 4000],
            [inewsStoryIdSequence[4].id, 5000],
          ])
        })
      })

      describe('when multiple low-ranked stories are moved into the middle of the story sequence', () => {
        it('fits the low-ranked stories ranks in between the surround stories ranks', () => {
          const testee: InewsStoryRankResolver = createTestee()
          const inewsStoryIdSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
            EntityTestFactory.createInewsStoryMetadata(),
          ]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [inewsStoryIdSequence[0].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[0], rank: 3000 })],
            [inewsStoryIdSequence[1].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[1], rank: 1000, versionLocator: 'newVersion' })],
            [inewsStoryIdSequence[2].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[2], rank: 2000, versionLocator: 'newVersion' })],
            [inewsStoryIdSequence[3].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[3], rank: 4000 })],
            [inewsStoryIdSequence[4].id, EntityTestFactory.createInewsStory({ ...inewsStoryIdSequence[4], rank: 5000 })],
          ])

          const result: ReadonlyMap<string, number> = testee.getInewsStoryRanks(inewsStoryIdSequence, cachedStories)

          expect(Array.from(result.entries())).toMatchObject([
            [inewsStoryIdSequence[0].id, 3000],
            [inewsStoryIdSequence[1].id, 3500],
            [inewsStoryIdSequence[2].id, 3750],
            [inewsStoryIdSequence[3].id, 4000],
            [inewsStoryIdSequence[4].id, 5000],
          ])
        })
      })
    })
  })
})

function createTestee(): InewsStoryRankResolver {
  return new InewsStoryRankResolverImplementation()
}
