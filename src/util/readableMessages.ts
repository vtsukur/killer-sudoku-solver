export const joinSetForReadability = (set: ReadonlySet<any>) => {
    return joinArrForReadability(Array.from(set));
};

export const joinArrForReadability = (array: ReadonlyArray<any>) => {
    return array.join(', ');
};
