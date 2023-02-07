import * as _ from 'lodash';
import { ReadonlyCages } from '../../puzzle/cage';
import { House } from '../../puzzle/house';
import { joinArray } from '../../util/readableMessages';
import { Combo, ReadonlyCombos } from './combo';
import { combosForSum, SumCombos } from './combosForSum';
import { BinaryStorage, FastNumSet } from './fastNumSet';

type NonOverlappingCageSumCombos = {
    permsForNonOverlappingCages: ReadonlyArray<ReadonlyCombos>,
    actualSumCombos: ReadonlyArray<ReadonlyCombos>
};

export function combosAndPermsForNonOverlappingHouseCages(cages: ReadonlyCages): NonOverlappingCageSumCombos {
    const totalSum = cages.reduce((partialSum, a) => partialSum + a.sum, 0);
    const nonOverlappingCagesCells = cages.reduce((partialCellCount, a) => partialCellCount + a.cellCount, 0);

    if (totalSum > House.SUM) {
        throw `Total cage with non-overlapping cells should be <= ${House.SUM}. Actual: ${totalSum}. Cages: {${joinArray(cages)}}`;
    }
    if (cages.length == 0) {
        return { permsForNonOverlappingCages: [], actualSumCombos: [] };
    }

    const combosForCages = cages.map(cage => combosForSum(cage.sum, cage.cellCount));
    if (combosForCages.length === 1) {
        return {
            permsForNonOverlappingCages: combosForCages[0].val.map(combo => [ combo ]),
            actualSumCombos: [ combosForCages[0].val ]
        };
    }

    const perms = new Array<ReadonlyCombos>();
    const stack = new Array<Combo>(cages.length);
    const numFlags = new FastNumSet();

    function combosRecursive_0(sumCombos: SumCombos, step: number) {
        for (const comboForSum of sumCombos.val) {
            stack[step] = comboForSum;

            numFlags.add(comboForSum.fastNumSet);
            combosRecursive(step + 1);
            numFlags.remove(comboForSum.fastNumSet);
        }
    }

    function combosRecursive_i(sumCombos: SumCombos, step: number) {
        for (const comboForSum of sumCombos.val) {
            if (numFlags.doesNotHaveAny(comboForSum.fastNumSet)) {
                stack[step] = comboForSum;

                numFlags.add(comboForSum.fastNumSet);
                combosRecursive(step + 1);
                numFlags.remove(comboForSum.fastNumSet);
            }
        }
    }

    const actualSumCombos = new Array<Array<Combo>>(cages.length);
    const actualSumCombosHash = new Array<Set<BinaryStorage>>();
    _.range(cages.length).forEach(i => {
        actualSumCombos[i] = [];
        actualSumCombosHash[i] = new Set<BinaryStorage>();
    });

    function combosRecursive_last() {
        perms.push([...stack]);
        _.range(cages.length).forEach(i => {
            actualSumCombosHash[i].add(stack[i].fastNumSet.binaryStorage);
        });
    }

    function combosRecursive_preLast_shortCircuit(sumCombos: SumCombos, step: number) {
        const lastCombo = sumCombos.get(numFlags.remaining());
        if (lastCombo !== undefined) {
            stack[step] = lastCombo;
            combosRecursive_last();
        }
    }

    const executionPipeline = new Array<(sumCombos: SumCombos, step: number) => void>(cages.length + 1);
    executionPipeline[0] = combosRecursive_0;
    if (nonOverlappingCagesCells === House.CELL_COUNT) {
        _.range(1, cages.length - 1).forEach(step => {
            executionPipeline[step] = combosRecursive_i;
        });
        executionPipeline[cages.length - 1] = combosRecursive_preLast_shortCircuit;
    } else {
        _.range(1, cages.length).forEach(step => {
            executionPipeline[step] = combosRecursive_i;
        });
        executionPipeline[cages.length] = combosRecursive_last;
    }

    function combosRecursive(step: number) {
        executionPipeline[step](combosForCages[step], step);
    }

    combosRecursive(0);

    _.range(cages.length).forEach(i => {
        const sumCombos = combosForCages[i];
        const actualSumCombosSet = actualSumCombosHash[i];

        for (const combo of sumCombos.val) {
            if (actualSumCombosSet.has(combo.fastNumSet.binaryStorage)) {
                actualSumCombos[i].push(combo);
            }
        }
    });

    return { permsForNonOverlappingCages: perms, actualSumCombos };
}
