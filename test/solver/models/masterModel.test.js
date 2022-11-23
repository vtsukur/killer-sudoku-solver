import { Cage } from '../../../src/problem/cage';
import { Cell } from '../../../src/problem/cell';
import { House } from '../../../src/problem/house';
import { MasterModel } from '../../../src/solver/models/masterModel';
import { sudokuDotCom_dailyChallengeOf_2022_11_01 } from '../../problem/realProblemSamples';

describe('Tests for master model', () => {
    test('Construction of master model (shallow coverage)', () => {
        const solver = new MasterModel(sudokuDotCom_dailyChallengeOf_2022_11_01);

        expect(solver.cellAt(2, 3)).toEqual(Cell.at(2, 3));
        expect(solver.rowModels.length).toBe(House.SIZE);
        expect(solver.rowModels[2].cages[1]).toEqual(Cage.ofSum(11).at(2, 3).at(2, 4).mk());
        expect(solver.columnModels.length).toBe(House.SIZE);
        expect(solver.columnModels[2].cages[1]).toEqual(Cage.ofSum(2).at(3, 2).mk());
        expect(solver.nonetSolvers.length).toBe(House.SIZE);
        expect(solver.nonetSolvers[1].cages[2]).toEqual(Cage.ofSum(11).at(2, 3).at(2, 4).mk());

        const aCellModelerminator = solver.cellSolverAt(2, 3);
        expect(aCellModelerminator.cell).toEqual(Cell.at(2, 3));
        expect(aCellModelerminator.rowModel.idx).toEqual(2);
        expect(aCellModelerminator.columnModel.idx).toEqual(3);
        expect(aCellModelerminator.nonetSolver.idx).toEqual(1);
        expect(aCellModelerminator.placedNum).toBe(undefined);
        // expect(aCellModelerminator.numOpts()).toEqual(new Set([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]));
        // expect(aCellModelerminator.withinCageModels).toEqual(new Set([ solver.inputCageAt(2, 3) ]));
    });
});
