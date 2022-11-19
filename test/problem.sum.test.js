import _ from 'lodash';
import { Sum, Cell } from '../src/problem/problem';

describe('Sum tests', () => {
    test('Sum creation', () => {
        const sum = new Sum(10, [ new Cell(4, 4), new Cell(4, 5) ]);
        expect(sum.value).toBe(10);
        expect(sum.cellCount).toBe(2);
        expect(sum.cells).toEqual([ new Cell(4, 4), new Cell(4, 5) ]);
    });

    test('Sum creation via builder', () => {
        const sum = Sum.of(10).cell(4, 4).cell(4, 5).mk();
        expect(sum.value).toBe(10);
        expect(sum.cellCount).toBe(2);
        expect(sum.cells).toEqual([ new Cell(4, 4), new Cell(4, 5) ]);
    });

    test('Sum within row', () => {
        expect(Sum.of(10).cell(4, 4).mk().isWithinRow).toBe(true);
        expect(Sum.of(10).cell(4, 4).cell(4, 5).mk().isWithinRow).toBe(true);
    });

    test('Sum not within row', () => {
        expect(Sum.of(10).cell(4, 4).cell(5, 4).mk().isWithinRow).toBe(false);
    });

    test('Sum within column', () => {
        expect(Sum.of(10).cell(5, 5).mk().isWithinColumn).toBe(true);
        expect(Sum.of(10).cell(5, 5).cell(6, 5).mk().isWithinColumn).toBe(true);
    });

    test('Sum not within column', () => {
        expect(Sum.of(10).cell(5, 5).cell(5, 6).mk().isWithinColumn).toBe(false);
    });

    test('Sum within subgrid', () => {
        expect(Sum.of(10).cell(6, 6).mk().isWithinSubgrid).toBe(true);
        expect(Sum.of(10).cell(6, 6).cell(6, 7).cell(6, 8).mk().isWithinSubgrid).toBe(true);
    });

    test('Sum not within subgrid', () => {
        expect(Sum.of(10).cell(5, 6).cell(6, 6).mk().isWithinSubgrid).toBe(false);
    });

    test('Sum not within row neither column nor subgrid', () => {
        const sum = Sum.of(10).cell(5, 6).cell(6, 6).cell(6, 5).mk();
        expect(sum.isWithinRow).toBe(false);
        expect(sum.isWithinColumn).toBe(false);
        expect(sum.isWithinSubgrid).toBe(false);
    });

    test('Sum key', () => {
        expect(new Sum(10, [ new Cell(4, 4), new Cell(4, 5) ]).key()).toBe(
            "10 [(4, 4), (4, 5)]");
    });

    test('Sum toString', () => {
        expect(new Sum(10, [ new Cell(4, 4), new Cell(4, 5) ]).toString()).toBe(
            "10 [(4, 4), (4, 5)]");
    });
});
