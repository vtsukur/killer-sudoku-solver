import _ from 'lodash';
import { Sum, Cell } from '../src/problem';

describe('Sum tests', () => {
    test('Sum creatiom', () => {
        const sum = new Sum(10, [ new Cell(4, 4), new Cell(4, 5) ]);
        expect(sum.value).toBe(10);
        expect(sum.cellCount).toBe(2);
        expect(sum.cells).toEqual([ new Cell(4, 4), new Cell(4, 5) ]);
    });

    test('Sum within row', () => {
        expect(new Sum(10, [ new Cell(4, 4) ]).isWithinRow).toBe(true);
        expect(new Sum(10, [ new Cell(4, 4), new Cell(4, 5) ]).isWithinRow).toBe(true);
    });

    test('Sum not within row', () => {
        expect(new Sum(10, [ new Cell(4, 4), new Cell(5, 4) ]).isWithinRow).toBe(false);
    });

    test('Sum within column', () => {
        expect(new Sum(10, [ new Cell(5, 5) ]).isWithinColumn).toBe(true);
        expect(new Sum(10, [ new Cell(5, 5), new Cell(6, 5) ]).isWithinColumn).toBe(true);
    });

    test('Sum not within column', () => {
        expect(new Sum(10, [ new Cell(5, 5), new Cell(5, 6) ]).isWithinColumn).toBe(false);
    });

    test('Sum within subgrid', () => {
        expect(new Sum(10, [ new Cell(6, 6) ]).isWithinSubgrid).toBe(true);
        expect(new Sum(10, [ new Cell(6, 6), new Cell(6, 7), new Cell(6, 8) ]).isWithinSubgrid).toBe(true);
    });

    test('Sum not within subgrid', () => {
        expect(new Sum(10, [ new Cell(5, 6), new Cell(6, 6) ]).isWithinSubgrid).toBe(false);
    });

    test('Sum not within row neither column nor subgrid', () => {
        const sum = new Sum(10, [ new Cell(5, 6), new Cell(6, 6), new Cell(6, 5) ]);
        expect(sum.isWithinRow).toBe(false);
        expect(sum.isWithinColumn).toBe(false);
        expect(sum.isWithinSubgrid).toBe(false);
    });
});
