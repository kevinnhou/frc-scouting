import { z } from "zod";

export const requiredString = z.string().min(1, { message: "Required" });

export const requiredNumber = z.number().int().min(1, { message: "Required" });

export const cycleSchema = z.object({
  "Algae Net": z.number().int().min(0).optional().default(0),
  "Algae Processor": z.number().int().min(0).optional().default(0),
  "Coral Level 1": z.number().int().min(0).optional().default(0),
  "Coral Level 2": z.number().int().min(0).optional().default(0),
  "Coral Level 3": z.number().int().min(0).optional().default(0),
  "Coral Level 4": z.number().int().min(0).optional().default(0),
  "Cycle Times": z.array(z.number().positive().multipleOf(0.01)),
});

export const cageTime = z.array(z.number().positive().multipleOf(0.01));

export const notes = z.object({
  tags: z.array(z.string()),
  text: z.string(),
});
