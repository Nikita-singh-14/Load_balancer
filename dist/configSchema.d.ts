import { z } from 'zod';
export declare const rootConfigSchema: z.ZodObject<{
    server: z.ZodObject<{
        listen: z.ZodNumber;
        workers: z.ZodOptional<z.ZodNumber>;
        upstreams: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>>;
        headers: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>>;
        rules: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            upstreams: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ConfigSchemaType = z.infer<typeof rootConfigSchema>;
//# sourceMappingURL=configSchema.d.ts.map