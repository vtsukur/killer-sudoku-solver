import _ from 'lodash';
import { Cell } from '../../src/problem/cell';

describe('Cell tests', () => {
    test('Construction of cell storing row and column', () => {
        const cell = Cell.at(4, 4);
        expect(cell.row).toBe(4);
        expect(cell.col).toBe(4);
    });

    test('Construction of invalid cell with row outside of the range: <0', () => {
        expect(() => Cell.at(-1, 4)).toThrow('Invalid cell. Row outside of range. Expected to be within [0, 9). Actual: -1');
    });

    test('Construction of invalid cell with row outside of the range: >8', () => {
        expect(() => Cell.at(9, 4)).toThrow('Invalid cell. Row outside of range. Expected to be within [0, 9). Actual: 9');
    });

    test('Construction of invalid cell with column outside of the range: <0', () => {
        expect(() => Cell.at(4, -1)).toThrow('Invalid cell. Column outside of range. Expected to be within [0, 9). Actual: -1');
    });

    test('Construction of invalid cell with column outside of the range: >8', () => {
        expect(() => Cell.at(4, 9)).toThrow('Invalid cell. Column outside of range. Expected to be within [0, 9). Actual: 9');
    });

    test('Cells have correct nonet index', () => {
        // north-west nonet (0)
        _.range(0, 3).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(0);
            })
        })

        // north nonet (1)
        _.range(0, 3).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(1);
            })
        })

        // north-east nonet (2)
        _.range(0, 3).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(2);
            })
        })

        // east nonet (3)
        _.range(3, 6).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(3);
            })
        })

        // center nonet (4)
        _.range(3, 6).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(4);
            })
        })

        // west nonet (5)
        _.range(3, 6).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(5);
            })
        })

        // south-west nonet (6)
        _.range(6, 9).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(6);
            })
        })

        // south nonet (7)
        _.range(6, 9).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(7);
            })
        })

        // south-east nonet (8)
        _.range(6, 9).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(8);
            })
        })
    });

    test('Cell key', () => {
        expect(Cell.at(4, 5).key).toBe('(4, 5)');
    });

    test('Cell toString', () => {
        expect(Cell.at(4, 5).toString()).toBe('(4, 5)');
    });
});
