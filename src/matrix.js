import { SUBGRID_SIDE_LENGTH, UNIQUE_SEGMENT_LENGTH } from './problem';

export const newGridMatrix = () => {
    return new Array(UNIQUE_SEGMENT_LENGTH).fill().map(() => new Array(UNIQUE_SEGMENT_LENGTH));
};

export const rowIdxInGridMatrixByAbsolute = (idx) => {
    return Math.floor(idx / UNIQUE_SEGMENT_LENGTH);
};

export const columnIdxInGridMatrixFromAbsloute = (idx) => {
    return idx % UNIQUE_SEGMENT_LENGTH;
};

