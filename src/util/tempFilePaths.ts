import * as fs from 'node:fs';

export class TempFilePaths {
    private dirPath: string;

    constructor(dirPath: string) {
        this.dirPath = dirPath;
    }

    recreateDir() {
        fs.rmSync(this.dirPath, { recursive: true, force: true });
        fs.mkdirSync(this.dirPath, { recursive: true });   
        return this; 
    }

    filePath(shortFileName: string) {
        return `${this.dirPath}/${shortFileName}`;
    }
}
