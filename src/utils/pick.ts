export function pick<TObject extends object, TKey extends keyof TObject>(
    obj: TObject,
    ...keys: TKey[]
): Pick<TObject, TKey> {
    const result: Partial<TObject> = {};
    keys.forEach((key) => {
        result[key] = obj[key];
    });
    return result as Pick<TObject, TKey>;
}
