import * as _ from 'lodash';
import * as fs from 'node:fs';
import { stringify } from 'yaml';
import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { SumAddendsCombinatorics } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { CageSizeNReductionsDb, ComboReductions, ReductionActions, ReductionEntry, SumReductions } from '../../../../../src/solver/strategies/reduction/db/reductionDb';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { logFactory } from '../../../../../src/util/logFactory';
import { CachedNumRanges } from '../../../../../src/util/cachedNumRanges';
import { CageModel3FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModel3FullReducer';

const log = logFactory.withLabel('reductionDbGenerator');

describe('ReductionDb', () => {

    test('Gets generated', () => {
        generateForSizeN(3);
    });

    const generateForSizeN = (cageSize: number) => {
        const cells = CachedNumRanges.ZERO_TO_N_LTE_81[cageSize].map(col => Cell.at(0, col));

        const sums: Array<SumReductions> = [];
        const reductionsDb: CageSizeNReductionsDb = {
            cageSize,
            sums
        };

        for (const sum of _.range(6, 25)) {
            const combos: Array<ComboReductions> = [];
            const sumReductions: SumReductions = { sum, combos };

            for (const combo of SumAddendsCombinatorics.enumerate(sum, cageSize).val) {
                const entries: Array<ReductionEntry> = [];
                const comboReductions: ComboReductions = {
                    combo: combo.numsSet.nums,
                    entries
                };

                const cage = Cage.ofSum(sum).withCells(cells).new();

                let validPerms = 0;
                let reductionActionable = 0;

                let state = 0;
                const cageSizeXCageSize = cageSize * cageSize;
                const maxStates = Math.pow(2, cageSizeXCageSize);
                while (state < maxStates) {
                    const cellMs = cells.map(cell => new CellModel(cell));
                    const cageM = new CageModel(cage, cellMs);
                    for (const cellM of cellMs) {
                        cellM.addWithinCageModel(cageM);
                    }
                    cageM.initialReduce();
                    const initialReductionMMR = new MasterModelReduction();
                    for (const comboNum of combo.numsSet.nums) {
                        cageM.reduceToCombinationsContaining(comboNum, initialReductionMMR);
                    }

                    const stateRadix2 = state.toString(2);
                    const paddedStateRadix2 = stateRadix2.padStart(cageSizeXCageSize, '0');
                    const stateRadix2_bitsStrings = new Array<string>();
                    for (const bucketIndex of CachedNumRanges.ZERO_TO_N_LTE_81[cageSize]) {
                        stateRadix2_bitsStrings.push(paddedStateRadix2.substring(bucketIndex * cageSize, (bucketIndex + 1) * cageSize));
                    }
                    const stateRadix2String = `0b${stateRadix2_bitsStrings.join('_')}`;

                    try {
                        if (!(state & (1 << 0))) cellMs[0].deleteNumOpt(combo.nthNumber(0));
                        if (!(state & (1 << 1))) cellMs[0].deleteNumOpt(combo.nthNumber(1));
                        if (!(state & (1 << 2))) cellMs[0].deleteNumOpt(combo.nthNumber(2));

                        if (!(state & (1 << 3))) cellMs[1].deleteNumOpt(combo.nthNumber(0));
                        if (!(state & (1 << 4))) cellMs[1].deleteNumOpt(combo.nthNumber(1));
                        if (!(state & (1 << 5))) cellMs[1].deleteNumOpt(combo.nthNumber(2));

                        if (!(state & (1 << 6))) cellMs[2].deleteNumOpt(combo.nthNumber(0));
                        if (!(state & (1 << 7))) cellMs[2].deleteNumOpt(combo.nthNumber(1));
                        if (!(state & (1 << 8))) cellMs[2].deleteNumOpt(combo.nthNumber(2));

                        const cellM3NumOptsBefore = new Set(cellMs[2].numOpts());
                        const cellM2NumOptsBefore = new Set(cellMs[1].numOpts());
                        const cellM1NumOptsBefore = new Set(cellMs[0].numOpts());

                        const reduction = new MasterModelReduction();
                        const reducer = new CageModel3FullReducer(cageM);
                        reducer.reduce(reduction);

                        const cellM3NumOptsAfter = new Set(cellMs[2].numOpts());
                        const cellM2NumOptsAfter = new Set(cellMs[1].numOpts());
                        const cellM1NumOptsAfter = new Set(cellMs[0].numOpts());

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
                                deleteNums: [
                                    cellM1DeletedNums,
                                    cellM2DeletedNums,
                                    cellM3DeletedNums
                                ]
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

                log.info(`Valid perms: ${validPerms} out of ${maxStates}`);
                log.info(`Reduction actionable: ${reductionActionable} out of ${validPerms} which are valid`);

                combos.push(comboReductions);
            }

            sums.push(sumReductions);
        }

        const reductionDbData = stringify(reductionsDb);
        fs.writeFileSync('./src/solver/strategies/reduction/db/cage3_reductions.yaml', reductionDbData, 'utf8');
    };

});
