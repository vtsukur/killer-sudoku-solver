import { Cage } from '../../../../src/puzzle/cage';
import { Cell } from '../../../../src/puzzle/cell';
import { House } from '../../../../src/puzzle/house';
import { MasterModel } from '../../../../src/solver/models/masterModel';
import { puzzleSamples } from '../../puzzle/puzzleSamples';

describe('Tests for master model', () => {
    test('Construction of master model (shallow coverage)', () => {
        const model = new MasterModel(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_11_01);

        expect(model.cellAt(2, 3)).toEqual(Cell.at(2, 3));
        expect(model.rowModels.length).toBe(House.SIZE);
        expect(model.rowModels[2].cageModels[1].cage).toEqual(Cage.ofSum(11).at(2, 3).at(2, 4).mk());
        expect(model.columnModels.length).toBe(House.SIZE);
        expect(model.columnModels[2].cageModels[1].cage).toEqual(Cage.ofSum(2).at(3, 2).mk());
        expect(model.nonetModels.length).toBe(House.SIZE);
        expect(model.nonetModels[1].cageModels[2].cage).toEqual(Cage.ofSum(11).at(2, 3).at(2, 4).mk());

        const aCellModel = model.cellModelAt(2, 3);
        expect(aCellModel.cell).toEqual(Cell.at(2, 3));
        expect(aCellModel.placedNum).toBe(undefined);
        expect(aCellModel.numOpts()).toEqual(new Set([ 2, 3, 4, 5, 6, 7, 8, 9 ]));
        // expect(aCellModel.withinCageModels).toEqual(new Set([ model.inputCageAt(2, 3) ]));
    });
});