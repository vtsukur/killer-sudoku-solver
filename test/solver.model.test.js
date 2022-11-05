import { GRID_CELL_COUNT, UNIQUE_SEGMENT_COUNT } from '../src/problem';
import { Cell, MutableSolverModel, Sum } from '../src/solver';
import testProblem from './testProblem';

describe('Tests for solver model', () => {
    test('Initialize (shallow coverage)', () => {
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
    });
});
