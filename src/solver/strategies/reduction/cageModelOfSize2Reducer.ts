import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet, ReadonlySudokuNumsSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';

export interface CageModelOfSize2Reducer extends CageModelReducer {

    doReduce(
            cellM0: CellModel,
            deletedNumOptsOfCellM0: ReadonlySudokuNumsSet,
            cellM1: CellModel,
            deletedNumOptsOfCellM1: ReadonlySudokuNumsSet,
            cageM: CageModel,
            cageMCombos: CombosSet,
            reduction: MasterModelReduction): void;

}
