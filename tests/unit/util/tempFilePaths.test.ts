import * as fs from 'node:fs';
import { TempFilePaths } from '../../../src/util/tempFilePaths';

describe('TempFilePaths tests', () => {
    const baseDir = './tmp/tempFilePaths-test';
    const paths = new TempFilePaths(baseDir);

    test('Determine file path with base dir', async () => {
        expect(paths.filePath('file.tmp')).toBe('./tmp/tempFilePaths-test/file.tmp');
    });

    test('Recreate base dir', async () => {
        paths.recreateBaseDirSync();
        expect(fs.existsSync(baseDir)).toBeTruthy();
    });
});
