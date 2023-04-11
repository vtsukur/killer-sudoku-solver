import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { Combo } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { CageModelOfSize3FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModelOfSize3FullReducer';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { logFactory } from '../../../../../src/util/logFactory';
import { joinArray } from '../../../../../src/util/readableMessages';
import { CageModelReducerTestConfig } from './cageModelReducerTestConfig';

const log = logFactory.withLabel('cageModelOfSize3Reducers.test');

describe('CageModelOfSize3Reducers', () => {

    const cell1 = Cell.at(0, 0);
    const cell2 = Cell.at(0, 1);
    const cell3 = Cell.at(0, 2);
    const cage = Cage.ofSum(9).withCell(cell1).withCell(cell2).withCell(cell3).new();

    let cellM1: CellModel;
    let cellM2: CellModel;
    let cellM3: CellModel;
    let cageM: CageModel;
    let reduction: MasterModelReduction;

    beforeEach(() => {
        cellM1 = new CellModel(cell1);
        cellM2 = new CellModel(cell2);
        cellM3 = new CellModel(cell3);
        cageM = new CageModel(cage, [ cellM1, cellM2, cellM3 ]);

        cellM1.addWithinCageModel(cageM);
        cellM2.addWithinCageModel(cageM);
        cellM3.addWithinCageModel(cageM);

        cageM.initialReduce();

        reduction = new MasterModelReduction();
    });

    const CONFIGS: ReadonlyArray<CageModelReducerTestConfig> = [
        {
            newReducer: (cageM: CageModel) => new CageModelOfSize3FullReducer(cageM),
            type: 'CageModelOfSize3FullReducer'
        }
    ];

    test('Enumerate', () => {
        const cell1 = Cell.at(0, 0);
        const cell2 = Cell.at(0, 1);
        const cell3 = Cell.at(0, 2);
        const cage = Cage.ofSum(6).withCell(cell1).withCell(cell2).withCell(cell3).new();

        let validPerms = 0;

        let state = 0;
        const combo = Combo.of(1, 2, 3);
        while (state < 512) {
            const cellM1 = new CellModel(cell1);
            const cellM2 = new CellModel(cell2);
            const cellM3 = new CellModel(cell3);
            const cageM = new CageModel(cage, [ cellM1, cellM2, cellM3 ]);
            cellM1.addWithinCageModel(cageM);
            cellM2.addWithinCageModel(cageM);
            cellM3.addWithinCageModel(cageM);
            cageM.initialReduce();

            let isPotentialReductionFailure;

            try {
                isPotentialReductionFailure = false;
                if (!(state & (1 << 0))) cellM1.deleteNumOpt(combo.nthNumber(0));
                if (!(state & (1 << 1))) cellM1.deleteNumOpt(combo.nthNumber(1));
                if (!(state & (1 << 2))) cellM1.deleteNumOpt(combo.nthNumber(2));

                if (!(state & (1 << 3))) cellM2.deleteNumOpt(combo.nthNumber(0));
                if (!(state & (1 << 4))) cellM2.deleteNumOpt(combo.nthNumber(1));
                if (!(state & (1 << 5))) cellM2.deleteNumOpt(combo.nthNumber(2));

                if (!(state & (1 << 6))) cellM3.deleteNumOpt(combo.nthNumber(0));
                if (!(state & (1 << 7))) cellM3.deleteNumOpt(combo.nthNumber(1));
                if (!(state & (1 << 8))) cellM3.deleteNumOpt(combo.nthNumber(2));

                log.info(`${state}: BEFORE CellM3(${joinArray(cellM3.numOpts())}), CellM2(${joinArray(cellM2.numOpts())}), CellM1(${joinArray(cellM1.numOpts())})`);

                isPotentialReductionFailure = true;
                const reduction = new MasterModelReduction();
                cageM.reduce(reduction);

                log.info(`${state}: AFTER SUCCESS CellM3(${joinArray(cellM3.numOpts())}), CellM2(${joinArray(cellM2.numOpts())}), CellM1(${joinArray(cellM1.numOpts())})`);

                ++validPerms;
            } catch (e) {
                // Can fail, that's OK.
                log.info(`${state}: FAIL FOR ${state.toString(2)} (${isPotentialReductionFailure ? 'reduction' : 'num deletion'})`);
            }
            log.info('');

            ++state;
        }

        log.info(`Valid perms: ${validPerms} out of 512`);
    });

    for (const { newReducer, type } of CONFIGS) {

        describe(type, () => {

            test('Does not reduce if there are no deletions for a particular `Combo`', () => {
                // Given:
                // ... initially reduced `CageModel` without extra deletions for its `CellModel`s.

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 2, 6),
                    Combo.of(1, 3, 5),
                    Combo.of(2, 3, 4)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
            });

        });

    }

});
