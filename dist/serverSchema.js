import { z } from 'zod';
export const workerMessageSchema = z.object({
    requestId: z.string(),
    requestType: z.enum(['HTTP']),
    headers: z.any(),
    body: z.any(),
    url: z.string(),
    statusCode: z.number().optional(),
});
export const workerMessageReplySchema = z.object({
    requestId: z.string(),
    data: z.string().optional(),
    error: z.string().optional(),
    errorCode: z.enum(['500', '502', '404']).optional(),
    statusCode: z.number().optional(),
});
//# sourceMappingURL=serverSchema.js.map