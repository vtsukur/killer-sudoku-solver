import { Puzzle } from '../../../../../../src/puzzle/puzzle';
import { MasterModel } from '../../../../../../src/solver/models/masterModel';
import { Context } from '../../../../../../src/solver/strategies/context';
import { CageSlicer } from '../../../../../../src/solver/transform/cageSlicer';

export const newContext = (puzzle: Puzzle) => {
    const masterModel = new MasterModel(puzzle);
    const cageSlider = new CageSlicer(masterModel);
    return new Context(masterModel, cageSlider);
};
