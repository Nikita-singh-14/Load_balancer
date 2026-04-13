import { type ConfigSchemaType } from "./configSchema.js";
interface CreateServerConfig {
    port: number;
    workerCount: number;
    config: ConfigSchemaType;
}
export declare function createServer(configInput: CreateServerConfig): Promise<void>;
export {};
//# sourceMappingURL=server.d.ts.map