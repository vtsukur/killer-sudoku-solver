import { Cage } from '../../../../../../src/puzzle/cage';
import { Cell } from '../../../../../../src/puzzle/cell';
import { Puzzle } from '../../../../../../src/puzzle/puzzle';
import { CageModel } from '../../../../../../src/solver/models/elements/cageModel';
import { MasterModel } from '../../../../../../src/solver/models/masterModel';
import { Context } from '../../../../../../src/solver/strategies/context';
import { CageSlicer } from '../../../../../../src/solver/transform/cageSlicer';

export const newContext = (puzzle: Puzzle) => {
    const masterModel = new MasterModel(puzzle);
    const cageSlider = new CageSlicer(masterModel);
    return new Context(masterModel, cageSlider);
};

export const newCageM = (model: MasterModel, sum: number, cells: ReadonlyArray<Cell>) => {
    return model.cageModelsMap.get(Cage.ofSum(sum).withCells(cells).new().key) as CageModel;
};