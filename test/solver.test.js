import reader from '../src/reader.js';
import { uniqueDigitsForSum } from '../src/solver';

describe('Solver tests', () => {
    test('Solve full', () => {
        const problem = reader('./problems/1.txt');
    });

    test('Unique digits for sum', () => {
        expect(uniqueDigitsForSum(17, 2)).toEqual([ new Set([8, 9]) ]);
    });
});
