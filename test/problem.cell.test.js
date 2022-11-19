import _ from 'lodash';
import { Cell } from '../src/problem/problem';

describe('Cell tests', () => {
    test('Cell creatiom', () => {
        const cell = new Cell(4, 4);
        expect(cell.rowIdx).toBe(4);
        expect(cell.colIdx).toBe(4);
    });

    test('Subgrid index for cells', () => {
        // north-west subgrid (0)
        _.range(0, 3).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(0);
            })
        })

        // north subgrid (1)
        _.range(0, 3).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(1);
            })
        })

        // north-east subgrid (2)
        _.range(0, 3).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(2);
            })
        })

        // east subgrid (3)
        _.range(3, 6).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(3);
            })
        })

        // center subgrid (4)
        _.range(3, 6).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(4);
            })
        })

        // west subgrid (5)
        _.range(3, 6).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(5);
            })
        })

        // south-west subgrid (6)
        _.range(6, 9).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(6);
            })
        })

        // south subgrid (7)
        _.range(6, 9).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(7);
            })
        })

        // south-east subgrid (8)
        _.range(6, 9).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(8);
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
