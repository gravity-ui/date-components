import type {AccessibilityProps} from '../types';

const DOMPropNames = new Set(['id']);

const labelablePropNames = new Set([
    'aria-label',
    'aria-labelledby',
    'aria-describedby',
    'aria-details',
]);

interface Options {
    /**
     * If labelling associated aria properties should be included in the filter.
     */
    labelable?: boolean;
    /**
     * A Set of other property names that should be included in the filter.
     */
    propNames?: Set<string>;
}

const propRe = /^(data-.*)$/;

/* FIXME: use the same function from @gravity-ui/uikit */
export function filterDOMProps(
    props: {id?: string} & AccessibilityProps,
    options: Options = {},
): {id?: string} & AccessibilityProps {
    const {labelable, propNames} = options;
    const filteredProps = {};

    for (const prop in props) {
        if (
            Object.prototype.hasOwnProperty.call(props, prop) &&
            (DOMPropNames.has(prop) ||
                (labelable && labelablePropNames.has(prop)) ||
                propNames?.has(prop) ||
                propRe.test(prop))
        ) {
            // @ts-expect-error
            filteredProps[prop] = props[prop];
        }
    }

    return filteredProps;
}
