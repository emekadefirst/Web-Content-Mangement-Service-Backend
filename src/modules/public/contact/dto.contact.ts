import { z } from "@hono/zod-openapi";
import { createContactSchema, contactResponseSchema } from "./schemas.contact";


// --- ADD THESE LINES ---
export type createContactDTO = z.infer<typeof createContactSchema>;
export type contactResponseDTO = z.infer<typeof contactResponseSchema>;