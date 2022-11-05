import { GRID_CELL_COUNT, UNIQUE_SEGMENT_COUNT } from '../src/problem';
import { Cell, MutableSolverModel, Sum } from '../src/solver';
import testProblem from './testProblem';

describe('Tests for solver model', () => {
    test('Initialize (shallow coverage) - whitebox', () => {
        const solverModel = new MutableSolverModel(testProblem);
        solverModel.init();

        expect(solverModel.cells.length).toBe(GRID_CELL_COUNT);
        expect(solverModel.cells[21]).toEqual(new Cell(2, 3));
        expect(solverModel.cellAt(2, 3)).toEqual(new Cell(2, 3));
        expect(solverModel.sums.length).toBe(33);
        expect(solverModel.sums[9]).toEqual(new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]));
        expect(solverModel.sumAt(2, 3)).toEqual(new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]));
        expect(solverModel.rows.length).toBe(UNIQUE_SEGMENT_COUNT);
        expect(solverModel.rows[2].sums[1]).toEqual(new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]));
        expect(solverModel.columns.length).toBe(UNIQUE_SEGMENT_COUNT);
        expect(solverModel.columns[2].sums[1]).toEqual(new Sum(2, [ new Cell(3, 2) ]));
        expect(solverModel.subgrids.length).toBe(UNIQUE_SEGMENT_COUNT);
        expect(solverModel.subgrids[1].sums[2]).toEqual(new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]));

        const aCellDeterminator = solverModel.cellsDeterminators[2][3];
        expect(aCellDeterminator.cell).toEqual(new Cell(2, 3));
        expect(aCellDeterminator.row.idx).toEqual(2);
        expect(aCellDeterminator.column.idx).toEqual(3);
        expect(aCellDeterminator.subgrid.idx).toEqual(1);
        expect(aCellDeterminator.placedNumber).toBe(undefined);
        expect(aCellDeterminator.numberOptions).toEqual(new Set([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]));
    });
});
