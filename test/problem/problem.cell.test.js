import _ from 'lodash';
import { Cell } from '../../src/problem/cell';

describe('Cell tests', () => {
    test('Cell creatiom', () => {
        const cell = new Cell(4, 4);
        expect(cell.rowIdx).toBe(4);
        expect(cell.colIdx).toBe(4);
    });

    test('NonetSolver index for cells', () => {
        // north-west nonetSolver (0)
        _.range(0, 3).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(new Cell(r, c).nonetIdx).toBe(0);
            })
        })

        // north nonetSolver (1)
        _.range(0, 3).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(new Cell(r, c).nonetIdx).toBe(1);
            })
        })

        // north-east nonetSolver (2)
        _.range(0, 3).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(new Cell(r, c).nonetIdx).toBe(2);
            })
        })

        // east nonetSolver (3)
        _.range(3, 6).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(new Cell(r, c).nonetIdx).toBe(3);
            })
        })

        // center nonetSolver (4)
        _.range(3, 6).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(new Cell(r, c).nonetIdx).toBe(4);
            })
        })

        // west nonetSolver (5)
        _.range(3, 6).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(new Cell(r, c).nonetIdx).toBe(5);
            })
        })

        // south-west nonetSolver (6)
        _.range(6, 9).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(new Cell(r, c).nonetIdx).toBe(6);
            })
        })

        // south nonetSolver (7)
        _.range(6, 9).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(new Cell(r, c).nonetIdx).toBe(7);
            })
        })

        // south-east nonetSolver (8)
        _.range(6, 9).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(new Cell(r, c).nonetIdx).toBe(8);
            })
        })
    });

    test('Cell key', () => {
        expect(new Cell(4, 5).key()).toBe("(4, 5)");
    });

    test('Cell toString', () => {
        expect(new Cell(4, 5).toString()).toBe("(4, 5)");
    });
});
