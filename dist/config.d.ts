export declare function parseYAMLConfig(filepath: string): Promise<string>;
export declare function validateConfig(config: string): Promise<{
    server: {
        listen: number;
        upstreams: {
            id: string;
            url: string;
        }[];
        rules: {
            path: string;
            upstreams: string[];
        }[];
        workers?: number | undefined;
        headers?: {
            key: string;
            value: string;
        }[] | undefined;
    };
}>;
//# sourceMappingURL=config.d.ts.map