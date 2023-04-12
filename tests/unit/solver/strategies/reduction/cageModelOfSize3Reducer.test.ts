import * as fs from 'node:fs';
import { stringify } from 'yaml';
import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { Combo, SumAddendsCombinatorics } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { CageModelOfSize3FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModelOfSize3FullReducer';
import { CageModelOfSize3Reducer } from '../../../../../src/solver/strategies/reduction/cageModelOfSize3Reducer';
import { CageSizeNReductionsDb, ReductionActions, ReductionEntry } from '../../../../../src/solver/strategies/reduction/db/reductionDb';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { logFactory } from '../../../../../src/util/logFactory';
import { CageModelReducerTestConfig } from './cageModelReducerTestConfig';
import { CageModelOfSize3DbReducer } from '../../../../../src/solver/strategies/reduction/cageModelOfSize3DbReducer';
import { SumReductions } from '../../../../../src/solver/strategies/reduction/db/reductionDb';
import { ComboReductions } from '../../../../../src/solver/strategies/reduction/db/reductionDb';

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
        },
        {
            newReducer: (cageM: CageModel) => new CageModelOfSize3Reducer(cageM),
            type: 'CageModelOfSize3Reducer'
        },
        {
            newReducer: (cageM: CageModel) => new CageModelOfSize3DbReducer(cageM),
            type: 'CageModelOfSize3DbReducer'
        }
    ];

    test('Enumerate', () => {
        const cell1 = Cell.at(0, 0);
        const cell2 = Cell.at(0, 1);
        const cell3 = Cell.at(0, 2);

        const sums: Array<SumReductions> = [];
        const cageSize = 3;
        const reductionsDb: CageSizeNReductionsDb = {
            cageSize,
            sums
        };

        for (const sum of [ 6 ]) {
            const combos: Array<ComboReductions> = [];
            const sumReductions: SumReductions = { sum, combos };

            for (const combo of SumAddendsCombinatorics.enumerate(sum, cageSize).val) {
                const entries: Array<ReductionEntry> = [];
                const comboReductions: ComboReductions = {
                    combo: combo.numsSet.nums,
                    entries
                };

                const cage = Cage.ofSum(sum).withCell(cell1).withCell(cell2).withCell(cell3).new();

                let validPerms = 0;
                let reductionActionable = 0;

                let state = 0;
                while (state < 512) {
                    const cellM1 = new CellModel(cell1);
                    const cellM2 = new CellModel(cell2);
                    const cellM3 = new CellModel(cell3);
                    const cageM = new CageModel(cage, [ cellM1, cellM2, cellM3 ]);
                    cellM1.addWithinCageModel(cageM);
                    cellM2.addWithinCageModel(cageM);
                    cellM3.addWithinCageModel(cageM);
                    cageM.initialReduce();

                    const stateRadix2 = state.toString(2);
                    const paddedStateRadix2 = stateRadix2.padStart(9, '0');
                    const stateRadix2_last3Bits = paddedStateRadix2.substring(0, 3);
                    const stateRadix2_middle3Bits = paddedStateRadix2.substring(3, 6);
                    const stateRadix2_first3Bits = paddedStateRadix2.substring(6);
                    const stateRadix2String = `0b${stateRadix2_last3Bits}_${stateRadix2_middle3Bits}_${stateRadix2_first3Bits}`;

                    try {
                        if (!(state & (1 << 0))) cellM1.deleteNumOpt(combo.nthNumber(0));
                        if (!(state & (1 << 1))) cellM1.deleteNumOpt(combo.nthNumber(1));
                        if (!(state & (1 << 2))) cellM1.deleteNumOpt(combo.nthNumber(2));

                        if (!(state & (1 << 3))) cellM2.deleteNumOpt(combo.nthNumber(0));
                        if (!(state & (1 << 4))) cellM2.deleteNumOpt(combo.nthNumber(1));
                        if (!(state & (1 << 5))) cellM2.deleteNumOpt(combo.nthNumber(2));

                        if (!(state & (1 << 6))) cellM3.deleteNumOpt(combo.nthNumber(0));
                        if (!(state & (1 << 7))) cellM3.deleteNumOpt(combo.nthNumber(1));
                        if (!(state & (1 << 8))) cellM3.deleteNumOpt(combo.nthNumber(2));

                        const cellM3NumOptsBefore = new Set(cellM3.numOpts());
                        const cellM2NumOptsBefore = new Set(cellM2.numOpts());
                        const cellM1NumOptsBefore = new Set(cellM1.numOpts());

                        const reduction = new MasterModelReduction();
                        cageM.reduce(reduction);

                        const cellM3NumOptsAfter = new Set(cellM3.numOpts());
                        const cellM2NumOptsAfter = new Set(cellM2.numOpts());
                        const cellM1NumOptsAfter = new Set(cellM1.numOpts());

                        let cellM1Used = false;
                        let cellM2Used = false;
                        let cellM3Used = false;
                        const cellM1DeletedNums = new Array<number>();
                        const cellM2DeletedNums = new Array<number>();
                        const cellM3DeletedNums = new Array<number>();
                        for (const originalNum of cellM1NumOptsBefore) {
                            if (!cellM1NumOptsAfter.has(originalNum)) {
                                cellM1DeletedNums.push(originalNum);
                                cellM1Used = true;
                            }
                        }
                        for (const originalNum of cellM2NumOptsBefore) {
                            if (!cellM2NumOptsAfter.has(originalNum)) {
                                cellM2DeletedNums.push(originalNum);
                                cellM2Used = true;
                            }
                        }
                        for (const originalNum of cellM3NumOptsBefore) {
                            if (!cellM3NumOptsAfter.has(originalNum)) {
                                cellM3DeletedNums.push(originalNum);
                                cellM3Used = true;
                            }
                        }

                        let actions: ReductionActions | undefined;
                        if (cellM1Used || cellM2Used || cellM3Used) {
                            ++reductionActionable;
                            actions = {
                                isDeleteCombo: false,
                                deleteNumsInCell1: cellM1DeletedNums.length ? cellM1DeletedNums : undefined,
                                deleteNumsInCell2: cellM2DeletedNums.length ? cellM2DeletedNums : undefined,
                                deleteNumsInCell3: cellM3DeletedNums.length ? cellM3DeletedNums : undefined
                            };
                        }

                        entries.push({
                            state,
                            stateRadix2String,
                            isValid: true,
                            actions
                        });

                        ++validPerms;
                    } catch (e) {
                        // Can fail, that's OK.
                        entries.push({
                            state,
                            stateRadix2String,
                            isValid: false,
                            actions: undefined
                        });
                    }

                    ++state;
                }

                log.info(`Valid perms: ${validPerms} out of 512`);
                log.info(`Reduction actionable: ${reductionActionable} out of ${validPerms} which are valid`);

                combos.push(comboReductions);
            }

            sums.push(sumReductions);
        }

        const reductionDbData = stringify(reductionsDb);
        fs.writeFileSync('./src/solver/strategies/reduction/db/cage3_reductions.yaml', reductionDbData, 'utf8');
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
