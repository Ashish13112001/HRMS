import { z } from 'zod';

export const healthDataSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
});

export type HealthData = z.infer<typeof healthDataSchema>;
