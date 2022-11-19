import { House } from '../problem/house';

export const newGridMatrix = () => {
    return new Array(House.SIZE).fill().map(() => new Array(House.SIZE));
};

export const rowIdxInGridMatrixByAbsolute = (idx) => {
    return Math.floor(idx / House.SIZE);
};

export const columnIdxInGridMatrixFromAbsloute = (idx) => {
    return idx % House.SIZE;
};
