export interface TypedEvent<Type extends string = string> {
  readonly type: Type
}
