class NonetAPI {
    readonly SIDE_LENGTH = 3;

    indexForCellAt(row: number, col: number) {
        return Math.floor(row / this.SIDE_LENGTH) * this.SIDE_LENGTH + Math.floor(col / this.SIDE_LENGTH);
    }
}

export const Nonet = new NonetAPI();
