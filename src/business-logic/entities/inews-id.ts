/**
 * iNews uses the format '<storyId>:<contentLocator>:<versionLocator>' to identify stories and differentiate versions.
 * The storyId is the id of the story.
 * The contentLocator changes when the content is edited.
 * The versionLocator changes when either the content is edited or the story is moved.
 */
export interface InewsId {
  readonly storyId: string
  readonly contentLocator: string
  readonly versionLocator: string
}
