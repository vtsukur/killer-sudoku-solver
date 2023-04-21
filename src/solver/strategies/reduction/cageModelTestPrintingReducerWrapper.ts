import { CageModel } from '../../models/elements/cageModel';
import { SudokuNumsSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';

export class CageModelTestPrintingReducerWrapper implements CageModelReducer {

    private readonly _cageM: CageModel;

    private readonly _delegate: CageModelReducer;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel, delegate: CageModelReducer) {
        this._cageM = cageM;
        this._delegate = delegate;
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        const numsPresentBeforeReduction = this._cageM.cellMs.map(cellM => cellM.numOpts());
        const numsDeletedBeforeReduction = this._cageM.cellMs.map(cellM => {
            return new SudokuNumsSet(reduction.deletedNumOptsOf(cellM)); // 1, 2
        });
        const combosBeforeReduction = this._cageM.comboSet.clone();

        this._delegate.reduce(reduction);

        const numsDeletedByReduction = this._cageM.cellMs.map((cellM, index) => {
            return new SudokuNumsSet(reduction.deletedNumOptsOf(cellM)).deleteAll(numsDeletedBeforeReduction[index]);
        });
        const combosAfterReduction = this._cageM.comboSet;
        if (numsDeletedByReduction.some(numsSet => numsSet.isNotEmpty)) {
            let testCode = 'test(\'Reduces case from real production scenario #\', () => {\n';
            testCode += '    // Given:\n';
            testCode += `    createCageM(${this._cageM.cage.sum});\n`;
            numsPresentBeforeReduction.forEach((numsSet, index) => {
                if (numsSet.length !== 9) {
                    testCode += `    cellM${index + 1}.reduceNumOpts(SudokuNumsSet.of(${numsSet.join(', ')}));\n`;
                }
            });
            testCode += '\n';
            testCode += '    // When:\n';
            testCode += '    newReducer(cageM).reduce(reduction);\n';
            testCode += '\n';
            testCode += '    // Then:\n';
            this._cageM.cellMs.forEach((cellM, index) => {
                testCode += `    expect(cellM${index + 1}.numOpts()).toEqual([ ${cellM.numOpts().join(', ')} ]);\n`;
            });
            testCode += '    expect(Array.from(cageM.comboSet.combos)).toEqual([\n';
            combosBeforeReduction.combos.forEach((combo, index) => {
                testCode += '        ';
                if (!combosAfterReduction.hasCombo(combo)) {
                    testCode += '// Deleted: ';
                }
                testCode += `Combo.of(${combo.nums.join(', ')})${index < combosBeforeReduction.combos.length - 1 ? ',' : ''}\n`;
            });
            testCode += '    ]);\n';
            this._cageM.cellMs.forEach((_cellM, index) => {
                if (numsDeletedByReduction[index].isEmpty) {
                    testCode += `    expect(reduction.deletedNumOptsOf(cellM${index + 1}).nums).toHaveLength(0);\n`;
                } else {
                    testCode += `    expect(reduction.deletedNumOptsOf(cellM${index + 1}).nums).toEqual([ ${numsDeletedByReduction[index].nums.join(', ')} ]);\n`;
                }
            });
            testCode += '});';

            console.log(testCode);
        }
    }

}
