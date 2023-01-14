export function joinSet<T>(set: ReadonlySet<T>) {
    return joinArray(Array.from(set));
}

export function joinArray<T>(array: ReadonlyArray<T>) {
    return array.join(', ');
}
