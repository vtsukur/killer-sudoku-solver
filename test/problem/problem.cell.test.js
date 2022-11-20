import _ from 'lodash';
import { Cell } from '../../src/problem/cell';

describe('Cell tests', () => {
    test('Cell creatiom', () => {
        const cell = Cell.at(4, 4);
        expect(cell.row).toBe(4);
        expect(cell.col).toBe(4);
    });

    test('NonetSolver index for cells', () => {
        // north-west nonetSolver (0)
        _.range(0, 3).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(0);
            })
        })

        // north nonetSolver (1)
        _.range(0, 3).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(1);
            })
        })

        // north-east nonetSolver (2)
        _.range(0, 3).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(2);
            })
        })

        // east nonetSolver (3)
        _.range(3, 6).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(3);
            })
        })

        // center nonetSolver (4)
        _.range(3, 6).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(4);
            })
        })

        // west nonetSolver (5)
        _.range(3, 6).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(5);
            })
        })

        // south-west nonetSolver (6)
        _.range(6, 9).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(6);
            })
        })

        // south nonetSolver (7)
        _.range(6, 9).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(7);
            })
        })

        // south-east nonetSolver (8)
        _.range(6, 9).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(Cell.at(r, c).nonet).toBe(8);
            })
        })
    });

    test('Cell key', () => {
        expect(Cell.at(4, 5).key()).toBe("(4, 5)");
    });

    test('Cell toString', () => {
        expect(Cell.at(4, 5).toString()).toBe("(4, 5)");
    });
});
