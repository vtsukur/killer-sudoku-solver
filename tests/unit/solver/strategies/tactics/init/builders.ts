import { Cage } from '../../../../../../src/puzzle/cage';
import { Cell } from '../../../../../../src/puzzle/cell';
import { Puzzle } from '../../../../../../src/puzzle/puzzle';
import { CageModel } from '../../../../../../src/solver/models/elements/cageModel';
import { MasterModel } from '../../../../../../src/solver/models/masterModel';
import { Context } from '../../../../../../src/solver/strategies/context';

export const newContext = (puzzle: Puzzle) => {
    const masterModel = new MasterModel(puzzle);
    const ctx = new Context(masterModel);
    masterModel.initialReduce();
    return ctx;
};

export const newCageM = (model: MasterModel, sum: number, cells: ReadonlyArray<Cell>) => {
    return model.cageModelsMap.get(Cage.ofSum(sum).withCells(cells).new().key) as CageModel;
};
