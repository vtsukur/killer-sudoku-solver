/* eslint-disable @typescript-eslint/no-explicit-any */
export const joinSet = (set: ReadonlySet<any>) => {
    return joinArray(Array.from(set));
};

export const joinArray = (array: ReadonlyArray<any>) => {
    return array.join(', ');
};
