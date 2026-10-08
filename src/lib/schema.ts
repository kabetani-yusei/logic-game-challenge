import { z } from "zod/mini"

// zod/mini は関数型 API で tree-shaking が効きやすく、バンドルサイズを抑えられる
export { z }
export type Schema<T> = z.ZodMiniType<T>

export const intBetween = (min: number, max: number) => z.int().check(z.minimum(min), z.maximum(max))
export const arrayMax = <T extends z.ZodMiniType>(item: T, max: number) => z.array(item).check(z.maxLength(max))
