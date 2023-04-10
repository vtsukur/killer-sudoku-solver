import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CageModelReducer } from '../../../../../src/solver/strategies/reduction/cageModelReducer';

type CageModelReducerProducer = (cageM: CageModel) => CageModelReducer;

export type CageModelReducerTestConfig = {

    readonly newReducer: CageModelReducerProducer;

    readonly type: string;

};
