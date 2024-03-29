import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CageModelReducer } from '../../../../../src/solver/strategies/reduction/cageModelReducer';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { logFactory } from '../../../../../src/util/logFactory';
import { LockableCageModel } from './lockableCageModel';
import { LockableMasterModelReduction } from './lockableMasterModelReduction';

const log = logFactory.withLabel('cageModelNReducer.perf');

export type CreateReferenceCageModelFn = () => LockableCageModel;

export type PrepareAndOrExpectReductionFn = (cageM: CageModel, reduction: MasterModelReduction) => void;

export type ComparablePerformanceTestConfig = {

    readonly createReferenceCageModel: CreateReferenceCageModelFn;

    readonly prepareForReduction: PrepareAndOrExpectReductionFn;

    readonly expectAfterTargetReduction: PrepareAndOrExpectReductionFn;

}

export type ReducerProducerFn = (cageM: CageModel) => CageModelReducer;

export type PerformanceTestPreparation = {

    readonly cageM: CageModel;

    readonly reduction: MasterModelReduction;

    readonly reducer: CageModelReducer;

};

export type PerformanceTestOptions = {

    readonly warmupIterationCount: number;

    readonly mainIterationCount: number;

}

const DEFAULT_PERFORMANCE_TEST_OPTIONS: PerformanceTestOptions = {
    warmupIterationCount: 100_000,
    mainIterationCount: 1_000_000
};

export const doRunFunctionalAndPerformanceTests = (
        config: ComparablePerformanceTestConfig,
        reducerProducer: ReducerProducerFn,
        type: string,
        options: PerformanceTestOptions = DEFAULT_PERFORMANCE_TEST_OPTIONS) => {
    // Checking that `CageModelReducer` works according to the functional expectations.
    runFunctionalTest(config, reducerProducer);

    const { cageM, reduction, reducer } = prepareForPerformanceTest(config, reducerProducer);

    let i = 0;

    //
    // Checking that the `CageModel` state stays intact
    // in between performance test iterations
    // to avoid impact on the reduction results that should be stable.
    //
    i = 0;
    const referenceCageMCombosSet = cageM.combosSet.bits;
    const cellMsNumOptsValues = cageM.cellMs.map(cellM => cellM._numOptsSet.bits);
    while (i++ < 10) {
        reducer.reduce(reduction);
        expect(cageM.combosSet.bits).toBe(referenceCageMCombosSet);
        cageM.cellMs.forEach((cellM, index) => {
            expect(cellM._numOptsSet.bits).toBe(cellMsNumOptsValues[index]);
        });
    }

    // Warming up by running sample iterations.
    i = 0;
    const warmupIterationCount = options.warmupIterationCount;
    while (i++ < warmupIterationCount) {
        reducer.reduce(reduction);
    }

    // Actual performance test.
    const startTime = performance.now();
    i = 0;
    const mainIterationCount = options.mainIterationCount;
    while (i++ < mainIterationCount) {
        reducer.reduce(reduction);
    }

    log.info(`${type} reducer: ${Math.trunc(performance.now() - startTime)} ms`);
};

export const runFunctionalTest = (config: ComparablePerformanceTestConfig, reducerProducer: ReducerProducerFn) => {
    const cageM = config.createReferenceCageModel();

    const reduction = new MasterModelReduction();
    config.prepareForReduction(cageM, reduction);
    reducerProducer(cageM).reduce(reduction);
    config.expectAfterTargetReduction(cageM, reduction);
};

export const prepareForPerformanceTest = (config: ComparablePerformanceTestConfig, reducerProducer: ReducerProducerFn) => {
    const cageM = config.createReferenceCageModel();
    const reduction = new LockableMasterModelReduction();

    config.prepareForReduction(cageM, reduction);

    reduction.lock();
    cageM.lock();

    return { cageM, reducer: reducerProducer(cageM), reduction } as PerformanceTestPreparation;
};
