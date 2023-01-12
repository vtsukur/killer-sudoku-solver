import * as fs from 'node:fs';
import { TempFilePaths } from '../../../src/util/tempFilePaths';

describe('TempFilePaths tests', () => {
    const baseDir = './tmp/tempFilePaths-test';
    const paths = new TempFilePaths(baseDir);

    test('Determine file path taking base dir into account', async () => {
        expect(paths.filePath('file.tmp')).toBe('./tmp/tempFilePaths-test/file.tmp');
    });

    test('Recreate base dir', async () => {
        paths.recreateDirSync();
        expect(fs.existsSync(baseDir)).toBeTruthy();
    });
});
