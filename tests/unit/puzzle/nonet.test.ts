import * as _ from 'lodash';
import { Nonet } from '../../../src/puzzle/nonet';

describe('Nonet tests', () => {
    test('Nonet side length is 3', () => {
        expect(Nonet.SIDE_LENGTH).toEqual(3);
    });

    test('Determination of Nonet index', () => {
        // north-west nonet (0)
        _.range(0, 3).forEach((row: number) => {
            _.range(0, 3).forEach((col: number) => {
                expect(Nonet.indexForCellAt(row, col)).toBe(0);
            });
        });

        // north nonet (1)
        _.range(0, 3).forEach((row: number) => {
            _.range(3, 6).forEach((col: number) => {
                expect(Nonet.indexForCellAt(row, col)).toBe(1);
            });
        });

        // north-east nonet (2)
        _.range(0, 3).forEach((row: number) => {
            _.range(6, 9).forEach((col: number) => {
                expect(Nonet.indexForCellAt(row, col)).toBe(2);
            });
        });

        // east nonet (3)
        _.range(3, 6).forEach((row: number) => {
            _.range(0, 3).forEach((col: number) => {
                expect(Nonet.indexForCellAt(row, col)).toBe(3);
            });
        });

        // center nonet (4)
        _.range(3, 6).forEach((row: number) => {
            _.range(3, 6).forEach((col: number) => {
                expect(Nonet.indexForCellAt(row, col)).toBe(4);
            });
        });

        // west nonet (5)
        _.range(3, 6).forEach((row: number) => {
            _.range(6, 9).forEach((col: number) => {
                expect(Nonet.indexForCellAt(row, col)).toBe(5);
            });
        });

        // south-west nonet (6)
        _.range(6, 9).forEach((row: number) => {
            _.range(0, 3).forEach((col: number) => {
                expect(Nonet.indexForCellAt(row, col)).toBe(6);
            });
        });

        // south nonet (7)
        _.range(6, 9).forEach((row: number) => {
            _.range(3, 6).forEach((col: number) => {
                expect(Nonet.indexForCellAt(row, col)).toBe(7);
            });
        });

        // south-east nonet (8)
        _.range(6, 9).forEach((row: number) => {
            _.range(6, 9).forEach((col: number) => {
                expect(Nonet.indexForCellAt(row, col)).toBe(8);
            });
        });
    });
});
