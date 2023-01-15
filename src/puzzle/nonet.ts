class NonetAPI {
    readonly SIDE_LENGTH = 3;

    indexForCellAt(row: number, col: number) {
        return Math.floor(row / Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH + Math.floor(col / Nonet.SIDE_LENGTH);
    }
}

export const Nonet = new NonetAPI();
