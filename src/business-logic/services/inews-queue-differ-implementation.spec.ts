import { InewsQueueDifferImplementation } from './inews-queue-differ-implementation'
import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'
import { InewsStory } from '../entities/inews-story'
import { EntityTestFactory } from '../factories/entity-test-factory'

describe(InewsQueueDifferImplementation.name, () => {
  describe(InewsQueueDifferImplementation.prototype.getMetadataForUncachedStories, () => {
    describe('when all stories are cached', () => {
      it('returns an empty array', () => {
        const storyMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata] = [
          EntityTestFactory.createInewsStoryMetadata(),
          EntityTestFactory.createInewsStoryMetadata(),
        ]
        const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
          [storyMetadataSequence[0].id, EntityTestFactory.createInewsStory(storyMetadataSequence[0])],
          [storyMetadataSequence[1].id, EntityTestFactory.createInewsStory(storyMetadataSequence[1])],
        ])
        const testee: InewsQueueDifferImplementation = createTestee()

        const result: readonly InewsStoryMetadata[] = testee.getMetadataForUncachedStories(storyMetadataSequence, cachedStories)

        expect(result).toMatchObject([])
      })
    })

    describe('when some stories are uncached', () => {
      it('returns metadata for the uncached stories', () => {
        const storyMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
          EntityTestFactory.createInewsStoryMetadata(),
          EntityTestFactory.createInewsStoryMetadata(),
          EntityTestFactory.createInewsStoryMetadata(),
        ]
        const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
          [storyMetadataSequence[0].id, EntityTestFactory.createInewsStory(storyMetadataSequence[0])],
          [storyMetadataSequence[2].id, EntityTestFactory.createInewsStory(storyMetadataSequence[2])],
        ])
        const testee: InewsQueueDifferImplementation = createTestee()

        const result: readonly InewsStoryMetadata[] = testee.getMetadataForUncachedStories(storyMetadataSequence, cachedStories)

        expect(result).toMatchObject([storyMetadataSequence[1]])
      })
    })
  })

  describe(InewsQueueDifferImplementation.prototype.getMetadataForStoriesWithChangedContent, () => {
    describe('when no stories have content changes', () => {
      it('returns empty array', () => {
        const storyMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata] = [
          EntityTestFactory.createInewsStoryMetadata(),
          EntityTestFactory.createInewsStoryMetadata(),
        ]
        const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
          [storyMetadataSequence[0].id, EntityTestFactory.createInewsStory(storyMetadataSequence[0])],
          [storyMetadataSequence[1].id, EntityTestFactory.createInewsStory(storyMetadataSequence[1])],
        ])
        const testee: InewsQueueDifferImplementation = createTestee()

        const result: readonly InewsStoryMetadata[] = testee.getMetadataForStoriesWithChangedContent(storyMetadataSequence, cachedStories)

        expect(result).toMatchObject([])
      })
    })

    describe('when some stories have changed content', () => {
      it('returns metadata for the changed stories', () => {
        const storyMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
          EntityTestFactory.createInewsStoryMetadata(),
          EntityTestFactory.createInewsStoryMetadata(),
          EntityTestFactory.createInewsStoryMetadata(),
        ]
        const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
          [storyMetadataSequence[0].id, EntityTestFactory.createInewsStory({ ...storyMetadataSequence[0], contentLocator: 'oldContent', versionLocator: 'oldVersion' })],
          [storyMetadataSequence[1].id, EntityTestFactory.createInewsStory(storyMetadataSequence[1])],
          [storyMetadataSequence[2].id, EntityTestFactory.createInewsStory(storyMetadataSequence[2])],
        ])
        const testee: InewsQueueDifferImplementation = createTestee()

        const result: readonly InewsStoryMetadata[] = testee.getMetadataForStoriesWithChangedContent(storyMetadataSequence, cachedStories)

        expect(result).toMatchObject([storyMetadataSequence[0]])
      })
    })

    describe('when the story version is changed but not the content', () => {
      it('ignores the story', () => {
        const cachedInewsStoryMetadata: InewsStoryMetadata = EntityTestFactory.createInewsStoryMetadata()
        const cachedStories: ReadonlyMap<string, InewsStory> = new Map([[cachedInewsStoryMetadata.id, EntityTestFactory.createInewsStory(cachedInewsStoryMetadata)]])
        const updatedInewsStoryMetadata: InewsStoryMetadata = {
          ...cachedInewsStoryMetadata,
          versionLocator: 'newVersion',
        }
        const storyMetadataSequence: readonly [InewsStoryMetadata] = [updatedInewsStoryMetadata]
        const testee: InewsQueueDifferImplementation = createTestee()

        const result: readonly InewsStoryMetadata[] = testee.getMetadataForStoriesWithChangedContent(storyMetadataSequence, cachedStories)

        expect(result).toMatchObject([])
      })
    })
  })

  describe(InewsQueueDifferImplementation.prototype.getMetadataForMovedStories.name, () => {
    describe('when a story has a changed version locator', () => {
      describe('when the content locator is unchanged', () => {
        it('classifies the story as moved', () => {
          const storyMetadataSequence: readonly [InewsStoryMetadata] = [EntityTestFactory.createInewsStoryMetadata()]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [storyMetadataSequence[0].id, EntityTestFactory.createInewsStory({ ...storyMetadataSequence[0], versionLocator: 'newVersion' })],
          ])
          const testee: InewsQueueDifferImplementation = createTestee()

          const result: readonly InewsStoryMetadata[] = testee.getMetadataForMovedStories(storyMetadataSequence, cachedStories)

          expect(result).toMatchObject([storyMetadataSequence[0]])
        })
      })

      describe('when the content locator is changed', () => {
        it('ignores the story', () => {
          const storyMetadataSequence: readonly [InewsStoryMetadata] = [EntityTestFactory.createInewsStoryMetadata()]
          const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
            [storyMetadataSequence[0].id, EntityTestFactory.createInewsStory({ ...storyMetadataSequence[0], contentLocator: 'newContent', versionLocator: 'newVersion' })],
          ])
          const testee: InewsQueueDifferImplementation = createTestee()

          const result: readonly InewsStoryMetadata[] = testee.getMetadataForMovedStories(storyMetadataSequence, cachedStories)

          expect(result).toMatchObject([])
        })
      })
    })
  })

  describe(InewsQueueDifferImplementation.prototype.getDeletedStoryIds.name, () => {
    describe('when no stories are deleted', () => {
      it('returns an empty array', () => {
        const storyMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
          EntityTestFactory.createInewsStoryMetadata(),
          EntityTestFactory.createInewsStoryMetadata(),
          EntityTestFactory.createInewsStoryMetadata(),
        ]
        const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
          [storyMetadataSequence[0].id, EntityTestFactory.createInewsStory(storyMetadataSequence[0])],
          [storyMetadataSequence[2].id, EntityTestFactory.createInewsStory(storyMetadataSequence[2])],
        ])
        const testee: InewsQueueDifferImplementation = createTestee()

        const result: readonly string[] = testee.getDeletedStoryIds(storyMetadataSequence, cachedStories)

        expect(result).toMatchObject([])
      })
    })

    describe('when stories have been deleted', () => {
      it('returns the ids for the deleted stories', () => {
        const storyMetadataSequence: readonly [InewsStoryMetadata, InewsStoryMetadata, InewsStoryMetadata] = [
          EntityTestFactory.createInewsStoryMetadata(),
          EntityTestFactory.createInewsStoryMetadata(),
          EntityTestFactory.createInewsStoryMetadata(),
        ]
        const deletedStories: readonly [InewsStory, InewsStory, InewsStory] = [
          EntityTestFactory.createInewsStory(),
          EntityTestFactory.createInewsStory(),
          EntityTestFactory.createInewsStory(),
        ]
        const cachedStories: ReadonlyMap<string, InewsStory> = new Map([
          [storyMetadataSequence[0].id, EntityTestFactory.createInewsStory(storyMetadataSequence[0])],
          [storyMetadataSequence[2].id, EntityTestFactory.createInewsStory(storyMetadataSequence[2])],
          [deletedStories[0].id, deletedStories[0]],
          [deletedStories[1].id, deletedStories[1]],
          [deletedStories[2].id, deletedStories[2]],
        ])
        const testee: InewsQueueDifferImplementation = createTestee()

        const result: readonly string[] = testee.getDeletedStoryIds(storyMetadataSequence, cachedStories)

        expect(result).toMatchObject(deletedStories.map(story => story.id))
      })
    })
  })
})

function createTestee(): InewsQueueDifferImplementation {
  return new InewsQueueDifferImplementation()
}
