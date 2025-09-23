export type ExtractFunctionType<T> = T extends (...args: infer A) => infer R
    ? (...args: A) => R
    : never;
