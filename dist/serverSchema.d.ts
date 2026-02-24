import { z } from 'zod';
export declare const workerMessageSchema: z.ZodObject<{
    requestId: z.ZodString;
    requestType: z.ZodEnum<{
        HTTP: "HTTP";
    }>;
    headers: z.ZodAny;
    body: z.ZodAny;
    url: z.ZodString;
    statusCode: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const workerMessageReplySchema: z.ZodObject<{
    requestId: z.ZodString;
    data: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    errorCode: z.ZodOptional<z.ZodEnum<{
        500: "500";
        502: "502";
        404: "404";
    }>>;
    statusCode: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type WorkerMessageType = z.infer<typeof workerMessageSchema>;
export type WorkerMessageReplyType = z.infer<typeof workerMessageReplySchema>;
//# sourceMappingURL=serverSchema.d.ts.map