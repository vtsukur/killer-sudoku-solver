import { Solution } from '../../../src/puzzle/solution';

describe('Solution tests', () => {
    test('Construction of Solution storing numbers matrix and checking both numbers and `toString` representation', () => {
        const solution = new Solution([
            [ 5, 1, 3, 9, 2, 8, 4, 7, 6 ],
            [ 2, 4, 8, 3, 7, 6, 1, 9, 5 ],
            [ 6, 7, 9, 4, 5, 1, 8, 2, 3 ],
            [ 9, 6, 7, 2, 8, 4, 5, 3, 1 ],
            [ 3, 8, 1, 5, 9, 7, 6, 4, 2 ],
            [ 4, 2, 5, 6, 1, 3, 7, 8, 9 ],
            [ 1, 9, 6, 7, 4, 2, 3, 5, 8 ],
            [ 7, 3, 2, 8, 6, 5, 9, 1, 4 ],
            [ 8, 5, 4, 1, 3, 9, 2, 6, 7 ]
        ]);

        expect(solution.numbers).toEqual([
            [ 5, 1, 3, 9, 2, 8, 4, 7, 6 ],
            [ 2, 4, 8, 3, 7, 6, 1, 9, 5 ],
            [ 6, 7, 9, 4, 5, 1, 8, 2, 3 ],
            [ 9, 6, 7, 2, 8, 4, 5, 3, 1 ],
            [ 3, 8, 1, 5, 9, 7, 6, 4, 2 ],
            [ 4, 2, 5, 6, 1, 3, 7, 8, 9 ],
            [ 1, 9, 6, 7, 4, 2, 3, 5, 8 ],
            [ 7, 3, 2, 8, 6, 5, 9, 1, 4 ],
            [ 8, 5, 4, 1, 3, 9, 2, 6, 7 ]
        ]);
        expect(solution.toString()).toBe(
            `
5 1 3 9 2 8 4 7 6
2 4 8 3 7 6 1 9 5
6 7 9 4 5 1 8 2 3
9 6 7 2 8 4 5 3 1
3 8 1 5 9 7 6 4 2
4 2 5 6 1 3 7 8 9
1 9 6 7 4 2 3 5 8
7 3 2 8 6 5 9 1 4
8 5 4 1 3 9 2 6 7`.trim()
        );
    });
});
