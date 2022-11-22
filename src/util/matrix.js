import { House } from '../problem/house';

export const newGridMatrix = () => {
    return new Array(House.SIZE).fill().map(() => new Array(House.SIZE));
};

export const rowInGridMatrixFromAbs = (idx) => {
    return Math.floor(idx / House.SIZE);
};

export const columnInGridMatrixFromAbs = (idx) => {
    return idx % House.SIZE;
};
