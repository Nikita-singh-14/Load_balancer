import { z } from 'zod';
export declare const workerMessageSchema: z.ZodObject<{
    requestType: z.ZodEnum<{
        HTTP: "HTTP";
    }>;
    headers: z.ZodAny;
    body: z.ZodAny;
    url: z.ZodString;
}, z.core.$strip>;
export declare const workerMessageReplySchema: z.ZodObject<{
    data: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    errorCode: z.ZodOptional<z.ZodEnum<{
        500: "500";
        404: "404";
    }>>;
}, z.core.$strip>;
export type WorkerMessageType = z.infer<typeof workerMessageSchema>;
export type WorkerMessageReplyType = z.infer<typeof workerMessageReplySchema>;
//# sourceMappingURL=serverSchema.d.ts.map