import { NameGenerator } from './name-generator'

describe(NameGenerator.constructor.name, () => {
  describe('getName', () => {
    it('returns "iNews Gateway"', () => {
      const nameGenerator: NameGenerator = new NameGenerator()

      const result: string = nameGenerator.getName()

      expect(result).toBe('iNews Gateway')
    })
  })
})
