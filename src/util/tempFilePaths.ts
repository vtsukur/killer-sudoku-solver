import * as fs from 'node:fs';

export class TempFilePaths {
    private baseDir: string;

    constructor(baseDir: string) {
        this.baseDir = baseDir;
    }

    recreateBaseDirSync() {
        fs.rmSync(this.baseDir, {
            recursive: true,
            force: true
        });
        fs.mkdirSync(this.baseDir, {
            recursive: true
        });
        return this;
    }

    filePath(shortFileName: string) {
        return `${this.baseDir}/${shortFileName}`;
    }
}
