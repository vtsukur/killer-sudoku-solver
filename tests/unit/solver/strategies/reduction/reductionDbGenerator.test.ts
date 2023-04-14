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
                        let i = 0;
                        while (i < cageSizeXCageSize) {
                            const cellMIndex = Math.trunc(i / cageSize);
                            const comboNumIndex = i % cageSize;
                            if (!(state & (1 << i))) cellMs[cellMIndex].deleteNumOpt(combo.nthNumber(comboNumIndex));

                            ++i;
                        }

                        const cellMsNumOptsBefore = cellMs.map(cellM => new Set(cellM.numOpts()));

                        const reduction = new MasterModelReduction();
                        const reducer = new CageModel3FullReducer(cageM);
                        reducer.reduce(reduction);

                        const cellMsNumOptsAfter = cellMs.map(cellM => new Set(cellM.numOpts()));

                        const cellMsUsed = new Array<boolean>(cageSize).fill(false);
                        const cellMsDeletedNums = CachedNumRanges.ZERO_TO_N_LTE_81[cageSize].map(() => new Array<number>());
                        cellMsNumOptsBefore.forEach((cellMNumOptsBefore, index) => {
                            for (const originalNum of cellMNumOptsBefore) {
                                if (!cellMsNumOptsAfter[index].has(originalNum)) {
                                    cellMsDeletedNums[index].push(originalNum);
                                    cellMsUsed[index] = true;
                                }
                            }
                        });

                        let actions: ReductionActions | undefined;
                        if (cellMsUsed.some(used => used)) {
                            ++reductionActionable;
                            actions = {
                                isDeleteCombo: false,
                                deleteNums: cellMsDeletedNums
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
