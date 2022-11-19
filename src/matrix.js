import { UNIQUE_SEGMENT_LENGTH } from './problem/constants';

export const newGridMatrix = () => {
    return new Array(UNIQUE_SEGMENT_LENGTH).fill().map(() => new Array(UNIQUE_SEGMENT_LENGTH));
};

export const rowIdxInGridMatrixByAbsolute = (idx) => {
    return Math.floor(idx / UNIQUE_SEGMENT_LENGTH);
};

export const columnIdxInGridMatrixFromAbsloute = (idx) => {
    return idx % UNIQUE_SEGMENT_LENGTH;
};
