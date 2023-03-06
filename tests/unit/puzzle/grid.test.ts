import { Grid } from '../../../src/puzzle/grid';

describe('Unit tests for `Grid`', () => {

    test('Sum of all `Cell`s in the `Grid` add up to 405', () => {
        expect(Grid.SUM).toEqual(405);
    });

});
