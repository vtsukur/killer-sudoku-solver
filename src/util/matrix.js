import { HOUSE_SIZE } from '../problem/constants';

export const newGridMatrix = () => {
    return new Array(HOUSE_SIZE).fill().map(() => new Array(HOUSE_SIZE));
};

export const rowIdxInGridMatrixByAbsolute = (idx) => {
    return Math.floor(idx / HOUSE_SIZE);
};

export const columnIdxInGridMatrixFromAbsloute = (idx) => {
    return idx % HOUSE_SIZE;
};
