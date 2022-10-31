import reader from '../src/reader.js';

describe('Problem tests', () => {
    test('Validate correct problem', () => {
        reader('./problems/1.txt').validateSevere();
    });
});
