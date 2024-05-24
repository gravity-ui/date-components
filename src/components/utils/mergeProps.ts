interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

type PropsArgs = Props | undefined | null;

type TupleTypes<T> = {[P in keyof T]: T[P]} extends {[key: number]: infer V}
    ? NullToObject<V>
    : never;
type NullToObject<T> = T extends null | undefined ? {} : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

export function mergeProps<T extends PropsArgs[]>(...args: T): UnionToIntersection<TupleTypes<T>> {
    const result: Props = {...args[0]};

    for (let i = 1; i < args.length; i++) {
        const props = args[i];
        if (!props) {
            continue;
        }
        for (const key of Object.keys(props)) {
            const left = result[key];
            const right = props[key];

            if (
                typeof left === 'function' &&
                typeof right === 'function' &&
                key.startsWith('on') &&
                key.charCodeAt(2) >= /* A */ 65 &&
                key.charCodeAt(2) <= /* Z */ 90
            ) {
                result[key] = chain(left, right);
            } else if (
                key === 'className' &&
                typeof left === 'string' &&
                typeof right === 'string'
            ) {
                result[key] = left + ' ' + right;
            } else if (
                key === 'controlProps' &&
                typeof left === 'object' &&
                typeof right === 'object'
            ) {
                result[key] = mergeProps(left, right);
            } else {
                result[key] = right === undefined ? left : right;
            }
        }
    }

    return result as UnionToIntersection<TupleTypes<T>>;
}

function chain(...fns: unknown[]) {
    return (...args: unknown[]) => {
        for (const fn of fns) {
            if (typeof fn === 'function') {
                fn(...args);
            }
        }
    };
}
