import { z } from 'zod';

export const idParamSchema = z.coerce.number().int().positive();
