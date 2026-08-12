import type { z } from "zod";

export function parseWithSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
) {
  return schema.safeParse(input);
}
