import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CageModelReducer } from '../../../../../src/solver/strategies/reduction/cageModelReducer';

export type CageModelReducerTestConfig = {

    readonly newReducer: (cageM: CageModel) => CageModelReducer;

    readonly type: string;

};
