import { UNIQUE_SEGMENT_LENGTH } from './problem';

export const newMatrix = () => {
    return new Array(UNIQUE_SEGMENT_LENGTH).fill().map(() => new Array(UNIQUE_SEGMENT_LENGTH));
}
