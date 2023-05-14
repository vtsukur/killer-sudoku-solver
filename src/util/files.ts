import * as fs from 'node:fs';

export const SRC_SOLVER_PATH = './src/solver';
export const UTF8_ENCODING = 'utf-8';

export const readTextFileSync = (filePath: string): string => {
    return fs.readFileSync(filePath, UTF8_ENCODING);
};
