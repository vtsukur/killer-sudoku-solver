import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { Combo } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { NumsReduction } from '../../../../../src/solver/strategies/numsReduction';

const cell1 = Cell.at(0, 0);
const cell2 = Cell.at(0, 1);
const cell3 = Cell.at(0, 2);

describe('Unit tests for `CageModel`', () => {

    let reduction: NumsReduction;

    beforeEach(() => {
        reduction = new NumsReduction();
    });

    test('Initial reduction for `CageModel` of size 2 with a single `Combo`', () => {
        const cellM1 = new CellModel(cell1);
        const cellM2 = new CellModel(cell2);
        const cage = Cage.ofSum(17).withCell(cell1).withCell(cell2).new();
        const cageM = new CageModel(cage, [ cellM1, cellM2 ]);

        cageM.initialReduce(reduction);

        expect(cellM1.numOpts()).toEqual([ 8, 9 ]);
        expect(cellM2.numOpts()).toEqual([ 8, 9 ]);
        expect(Array.from(cageM.combos)).toEqual([
            Combo.of(8, 9)
        ]);
    });

    test('Initial reduction for `CageModel` of size 2 with several `Combo`s', () => {
        const cellM1 = new CellModel(cell1);
        const cellM2 = new CellModel(cell2);
        const cage = Cage.ofSum(13).withCell(cell1).withCell(cell2).new();
        const cageM = new CageModel(cage, [ cellM1, cellM2 ]);

        cageM.initialReduce(reduction);

        expect(cellM1.numOpts()).toEqual([ 4, 5, 6, 7, 8, 9 ]);
        expect(cellM2.numOpts()).toEqual([ 4, 5, 6, 7, 8, 9 ]);
        expect(Array.from(cageM.combos)).toEqual([
            Combo.of(4, 9),
            Combo.of(5, 8),
            Combo.of(6, 7)
        ]);
    });

    test('Initial reduction for `CageModel` of size 3 with a single `Combo`', () => {
        const cellM1 = new CellModel(cell1);
        const cellM2 = new CellModel(cell2);
        const cellM3 = new CellModel(cell3);
        const cage = Cage.ofSum(24).withCell(cell1).withCell(cell2).withCell(cell3).new();
        const cageM = new CageModel(cage, [ cellM1, cellM2, cellM3 ]);

        cageM.initialReduce(reduction);

        expect(cellM1.numOpts()).toEqual([ 7, 8, 9 ]);
        expect(cellM2.numOpts()).toEqual([ 7, 8, 9 ]);
        expect(cellM3.numOpts()).toEqual([ 7, 8, 9 ]);
        expect(Array.from(cageM.combos)).toEqual([
            Combo.of(7, 8, 9)
        ]);
    });

    describe('Reduction of `CageModel` with 2 `Cell`s having several `Combo`s', () => {

        const cage = Cage.ofSum(11).withCell(cell1).withCell(cell2).new();

        let cellM1: CellModel;
        let cellM2: CellModel;
        let cageM: CageModel;

        beforeEach(() => {
            cellM1 = new CellModel(cell1);
            cellM2 = new CellModel(cell2);
            cageM = new CageModel(cage, [ cellM1, cellM2 ]);
            cellM1.addWithinCageModel(cageM);
            cellM2.addWithinCageModel(cageM);
            cageM.initialReduce();
        });

        test('After deleting the 1-st number option of a particular `Combo` in the 1-st `Cell`', () => {
            reduction.deleteNumOpt(cellM1, 5);

            const newReduction = new NumsReduction();
            cageM.reduce(reduction, newReduction);
            const impactedCageMs = newReduction.impactedCageModels;

            expect(impactedCageMs).toEqual(new Set([ cageM ]));
            expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
            expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
            expect(Array.from(cageM.combos)).toEqual([
                Combo.of(2, 9),
                Combo.of(3, 8),
                Combo.of(4, 7),
                Combo.of(5, 6)
            ]);
        });

        test('After deleting the 1-st number option of a particular `Combo` in the 2-nd `Cell`', () => {
            reduction.deleteNumOpt(cellM2, 5);

            const newReduction = new NumsReduction();
            cageM.reduce(reduction, newReduction);
            const impactedCageMs = newReduction.impactedCageModels;

            expect(impactedCageMs).toEqual(new Set([ cageM ]));
            expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
            expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
            expect(Array.from(cageM.combos)).toEqual([
                Combo.of(2, 9),
                Combo.of(3, 8),
                Combo.of(4, 7),
                Combo.of(5, 6)
            ]);
        });

        test('After deleting the 2-nd number option of a particular `Combo` in the 1-st `Cell`', () => {
            reduction.deleteNumOpt(cellM1, 6);

            const newReduction = new NumsReduction();
            cageM.reduce(reduction, newReduction);
            const impactedCageMs = newReduction.impactedCageModels;

            expect(impactedCageMs).toEqual(new Set([ cageM ]));
            expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
            expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
            expect(Array.from(cageM.combos)).toEqual([
                Combo.of(2, 9),
                Combo.of(3, 8),
                Combo.of(4, 7),
                Combo.of(5, 6)
            ]);
        });

        test('After deleting the 2-nd number option of a particular `Combo` in the 2-nd `Cell`', () => {
            reduction.deleteNumOpt(cellM2, 6);

            const newReduction = new NumsReduction();
            cageM.reduce(reduction, newReduction);
            const impactedCageMs = newReduction.impactedCageModels;

            expect(impactedCageMs).toEqual(new Set([ cageM ]));
            expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
            expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
            expect(Array.from(cageM.combos)).toEqual([
                Combo.of(2, 9),
                Combo.of(3, 8),
                Combo.of(4, 7),
                Combo.of(5, 6)
            ]);
        });

        test('After deleting the 1-st number option of a particular `Combo` in both `Cell`s', () => {
            reduction.deleteNumOpt(cellM1, 5);
            reduction.deleteNumOpt(cellM2, 5);

            const newReduction = new NumsReduction();
            cageM.reduce(reduction, newReduction);
            const impactedCageMs = newReduction.impactedCageModels;

            expect(impactedCageMs).toEqual(new Set([ cageM ]));
            expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
            expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
            expect(Array.from(cageM.combos)).toEqual([
                Combo.of(2, 9),
                Combo.of(3, 8),
                Combo.of(4, 7)
            ]);
        });

        test('After deleting the 2-nd number option of a particular `Combo` in both `Cell`s', () => {
            reduction.deleteNumOpt(cellM1, 6);
            reduction.deleteNumOpt(cellM2, 6);

            const newReduction = new NumsReduction();
            cageM.reduce(reduction, newReduction);
            const impactedCageMs = newReduction.impactedCageModels;

            expect(impactedCageMs).toEqual(new Set([ cageM ]));
            expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
            expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
            expect(Array.from(cageM.combos)).toEqual([
                Combo.of(2, 9),
                Combo.of(3, 8),
                Combo.of(4, 7)
            ]);
        });

        test('After no deletions for a particular `Combo`', () => {
            const newReduction = new NumsReduction();
            cageM.reduce(reduction, newReduction);
            const impactedCageMs = newReduction.impactedCageModels;

            expect(impactedCageMs).toEqual(new Set());
            expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 5, 6, 7, 8, 9 ]);
            expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 5, 6, 7, 8, 9 ]);
            expect(Array.from(cageM.combos)).toEqual([
                Combo.of(2, 9),
                Combo.of(3, 8),
                Combo.of(4, 7),
                Combo.of(5, 6)
            ]);
        });

        test('After deleting all number options for a particular `Combo`', () => {
            reduction.deleteNumOpt(cellM1, 5);
            reduction.deleteNumOpt(cellM1, 6);
            reduction.deleteNumOpt(cellM2, 5);
            reduction.deleteNumOpt(cellM2, 6);

            const newReduction = new NumsReduction();
            cageM.reduce(reduction, newReduction);
            const impactedCageMs = newReduction.impactedCageModels;

            expect(impactedCageMs).toEqual(new Set());
            expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
            expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
            expect(Array.from(cageM.combos)).toEqual([
                Combo.of(2, 9),
                Combo.of(3, 8),
                Combo.of(4, 7)
            ]);
        });

    });

    test('Reduction for `CageModel` of size 7 and sum 31 with 2 `Combo`s after partial reduce (real case from `dailyKillerSudokuDotCom_puzzle24789_difficulty10`)', () => {
        const cell_04 = Cell.at(0, 4);
        const cell_05 = Cell.at(0, 5);
        const cell_06 = Cell.at(0, 6);
        const cell_13 = Cell.at(1, 3);
        const cell_14 = Cell.at(1, 4);
        const cell_15 = Cell.at(1, 5);
        const cell_16 = Cell.at(1, 6);

        const cellM_04 = new CellModel(cell_04);
        const cellM_05 = new CellModel(cell_05);
        const cellM_06 = new CellModel(cell_06);
        const cellM_13 = new CellModel(cell_13);
        const cellM_14 = new CellModel(cell_14);
        const cellM_15 = new CellModel(cell_15);
        const cellM_16 = new CellModel(cell_16);
        const cellMs = [ cellM_04, cellM_05, cellM_06,
            cellM_13, cellM_14, cellM_15, cellM_16 ];

        const cage = Cage.ofSum(31)
            .withCell(cell_04).withCell(cell_05).withCell(cell_06)
            .withCell(cell_13).withCell(cell_14).withCell(cell_15).withCell(cell_16)
            .new();
        const cageM = new CageModel(cage, cellMs);

        cageM.initialReduce(reduction);

        const initialCombos = Array.from(cageM.combos);
        expect(initialCombos).toEqual([
            Combo.of(1, 2, 3, 4, 5, 7, 9),
            Combo.of(1, 2, 3, 4, 6, 7, 8)
        ]);

        cellM_04.deleteNumOpt(3); cellM_04.deleteNumOpt(9);
        cellM_05.deleteNumOpt(3); cellM_05.deleteNumOpt(9);
        cellM_06.deleteNumOpt(3); cellM_06.deleteNumOpt(9);
        cellM_13.deleteNumOpt(4); cellM_13.deleteNumOpt(8); cellM_13.deleteNumOpt(9);
        cellM_14.deleteNumOpt(4); cellM_14.deleteNumOpt(8); cellM_14.deleteNumOpt(9);
        cellM_15.deleteNumOpt(4); cellM_15.deleteNumOpt(8); cellM_15.deleteNumOpt(9);
        cellM_16.deleteNumOpt(4); cellM_16.deleteNumOpt(7); cellM_16.deleteNumOpt(8); cellM_16.deleteNumOpt(9);

        cageM.reduce(reduction, new NumsReduction());

        const afterReductionCombos = Array.from(cageM.combos);
        expect(afterReductionCombos).toEqual([
            Combo.of(1, 2, 3, 4, 6, 7, 8)
        ]);
    });

});
