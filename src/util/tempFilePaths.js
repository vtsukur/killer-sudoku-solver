import * as fs from 'node:fs';

export class TempFilePaths {
    #dirPath;

    constructor(dirPath) {
        this.#dirPath = dirPath;
    }

    recreateDir() {
        fs.rmSync(this.#dirPath, { recursive: true, force: true });
        fs.mkdirSync(this.#dirPath, { recursive: true });   
        return this; 
    }

    filePath(shortFileName) {
        return `${this.#dirPath}/${shortFileName}`;
    }
}
