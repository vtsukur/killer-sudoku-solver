import reader from '../src/reader.js';

describe('Problem tests', () => {
    test('Check correct problem', () => {
        reader('./problems/1.txt').checkCorrectness();
    });
});
