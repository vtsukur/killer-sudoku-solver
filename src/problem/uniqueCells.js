export const cellSetAndDuplicatesOf = (cells) => {
    const cellSet = new Set();
    const duplicateCellKeys = [];
    cells.forEach(cell => {
        if (cellSet.has(cell.key)) {
            duplicateCellKeys.push(cell.key);
        } else {
            cellSet.add(cell.key);
        }
    });
    return { cellSet, duplicateCellKeys };
}
