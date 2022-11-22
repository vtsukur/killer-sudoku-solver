import { Nonet } from '../../src/problem/nonet';

describe('Nonet tests', () => {
    test('Nonet is not construtable', () => {
        expect(() => new Nonet()).toThrow('Nonet is not constructable');
    });

    test('None side length is 3', () => {
        expect(Nonet.SIDE_LENGTH).toEqual(3);
    });
});
