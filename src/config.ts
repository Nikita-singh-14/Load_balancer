import fs from 'node:fs/promises';
import { parse } from 'yaml';
import {rootConfigSchema} from './schema/configSchema.js';

export async function parseYAMLConfig(filepath: string) {
    const configFileContent = await fs.readFile(filepath, 'utf8');
    const configParsed = parse(configFileContent);
    return JSON.stringify(configParsed);   
}

export async function validateConfig(config: string) {
    const validateConfig = await rootConfigSchema.parseAsync(JSON.parse(config));
    return validateConfig;
}