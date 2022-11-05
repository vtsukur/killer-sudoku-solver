import { Cell, Sum, GRID_CELL_COUNT, UNIQUE_SEGMENT_COUNT } from '../src/problem';
import { Solver } from '../src/solver';
import testProblem from './testProblem';

describe('Tests for solver', () => {
    test('Initialize (shallow coverage) - whitebox', () => {
        const solver = new Solver(testProblem);

        expect(solver.cells.length).toBe(GRID_CELL_COUNT);
        expect(solver.cells[21]).toEqual(new Cell(2, 3));
        expect(solver.cellAt(2, 3)).toEqual(new Cell(2, 3));
        expect(solver.inputSums.length).toBe(33);
        expect(solver.inputSums[9]).toEqual(new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]));
        expect(solver.inputSumAt(2, 3)).toEqual(new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]));
        expect(solver.allSumsMatrix[2][3]).toEqual(
            new Set([ new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]) ]));
        expect(solver.rows.length).toBe(UNIQUE_SEGMENT_COUNT);
        expect(solver.rows[2].sums[1]).toEqual(new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]));
        expect(solver.columns.length).toBe(UNIQUE_SEGMENT_COUNT);
        expect(solver.columns[2].sums[1]).toEqual(new Sum(2, [ new Cell(3, 2) ]));
        expect(solver.subgrids.length).toBe(UNIQUE_SEGMENT_COUNT);
        expect(solver.subgrids[1].sums[2]).toEqual(new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]));

        const aCellDeterminator = solver.cellsDeterminatorsMatrix[2][3];
        expect(aCellDeterminator.cell).toEqual(new Cell(2, 3));
        expect(aCellDeterminator.row.idx).toEqual(2);
        expect(aCellDeterminator.column.idx).toEqual(3);
        expect(aCellDeterminator.subgrid.idx).toEqual(1);
        expect(aCellDeterminator.placedNumber).toBe(undefined);
        expect(aCellDeterminator.numberOptions).toEqual(new Set([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]));
        expect(aCellDeterminator.withinSums).toEqual(new Set([ solver.inputSumAt(2, 3) ]));
    });
});
