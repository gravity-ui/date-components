import React from 'react';

import {useForkRef} from '@gravity-ui/uikit';
import type {CSSProperties} from '@gravity-ui/uikit';

import {mergeProps} from '../components/utils/mergeProps';

export interface SlotProps {
    /**
     * A slot name for the component. Slots allow the component to receive props from a parent component.
     * An explicit `null` value indicates that the local props completely override all props received from a parent.
     */
    slot?: string | null;
}

export const DEFAULT_SLOT = Symbol('default');

interface SlottedValue<T> {
    slots?: Record<string | symbol, T>;
}

export type SlottedContextValue<T> = SlottedValue<T> | T | null | undefined;
export type ContextValue<T, E> = SlottedContextValue<WithRef<T, E>>;
export type WithRef<T, E> = T & {ref?: React.ForwardedRef<E>};

type ProviderValue<T> = [React.Context<T>, T];
type ProviderValues<A, B, C, D, E, F, G, H, I, J, K> =
    | [ProviderValue<A>]
    | [ProviderValue<A>, ProviderValue<B>]
    | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>]
    | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>]
    | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>]
    | [
          ProviderValue<A>,
          ProviderValue<B>,
          ProviderValue<C>,
          ProviderValue<D>,
          ProviderValue<E>,
          ProviderValue<F>,
      ]
    | [
          ProviderValue<A>,
          ProviderValue<B>,
          ProviderValue<C>,
          ProviderValue<D>,
          ProviderValue<E>,
          ProviderValue<F>,
          ProviderValue<G>,
      ]
    | [
          ProviderValue<A>,
          ProviderValue<B>,
          ProviderValue<C>,
          ProviderValue<D>,
          ProviderValue<E>,
          ProviderValue<F>,
          ProviderValue<G>,
          ProviderValue<H>,
      ]
    | [
          ProviderValue<A>,
          ProviderValue<B>,
          ProviderValue<C>,
          ProviderValue<D>,
          ProviderValue<E>,
          ProviderValue<F>,
          ProviderValue<G>,
          ProviderValue<H>,
          ProviderValue<I>,
      ]
    | [
          ProviderValue<A>,
          ProviderValue<B>,
          ProviderValue<C>,
          ProviderValue<D>,
          ProviderValue<E>,
          ProviderValue<F>,
          ProviderValue<G>,
          ProviderValue<H>,
          ProviderValue<I>,
          ProviderValue<J>,
      ]
    | [
          ProviderValue<A>,
          ProviderValue<B>,
          ProviderValue<C>,
          ProviderValue<D>,
          ProviderValue<E>,
          ProviderValue<F>,
          ProviderValue<G>,
          ProviderValue<H>,
          ProviderValue<I>,
          ProviderValue<J>,
          ProviderValue<K>,
      ];
interface ProviderProps<A, B, C, D, E, F, G, H, I, J, K> {
    values: ProviderValues<A, B, C, D, E, F, G, H, I, J, K>;
    children: React.ReactNode;
}

export function Provider<A, B, C, D, E, F, G, H, I, J, K>({
    values,
    children,
}: ProviderProps<A, B, C, D, E, F, G, H, I, J, K>) {
    let result: JSX.Element = <React.Fragment>{children}</React.Fragment>;
    for (const [Context, value] of values) {
        result = <Context.Provider value={value as any}>{result}</Context.Provider>;
    }

    return result;
}

export function useGuardedContext<T>(context: React.Context<T | null>) {
    const value = React.useContext(context);
    if (value === undefined || value === null) {
        throw new Error(
            `Component must be used inside ${context.displayName || 'context'} provider`,
        );
    }
    return value;
}

export function useSlottedContext<T>(
    context: React.Context<SlottedContextValue<T>>,
    slot?: string | null,
): T | null | undefined {
    const ctx = React.useContext(context);
    if (slot === null) {
        // An explicit `null` slot means don't use context.
        return null;
    }
    if (ctx && typeof ctx === 'object' && 'slots' in ctx && ctx.slots) {
        const availableSlots = Object.keys(ctx.slots)
            .map((p) => `"${p}"`)
            .join(', ');

        if (!slot && !ctx.slots[DEFAULT_SLOT]) {
            throw new Error(`A slot prop is required. Valid slot names are ${availableSlots}.`);
        }
        const slotKey = slot || DEFAULT_SLOT;
        if (!ctx.slots[slotKey]) {
            throw new Error(`Invalid slot "${slot}". Valid slot names are ${availableSlots}.`);
        }
        return ctx.slots[slotKey];
    }

    return ctx as T;
}

export function useContextProps<T, E>(
    props: T & SlotProps,
    ref: React.ForwardedRef<E>,
    context: React.Context<ContextValue<T, E>>,
): [T, React.Ref<E>] {
    const ctx = useSlottedContext(context, props.slot);
    const {ref: contextRef, ...contextProps} = ctx ?? {};

    const mergedRefs = useForkRef(ref, contextRef);
    const mergedProps = mergeProps(contextProps, props) as T;

    return [mergedProps, mergedRefs];
}

export interface StyleRenderProps<T> {
    /** The CSS className for the element. A function may be provided to compute the class based on component state. */
    className?: string | ((values: T & {defaultClassName: string | undefined}) => string);
    /** The inline style for the element. A function may be provided to compute the style based on component state. */
    style?:
        | CSSProperties
        | ((values: T & {defaultStyle: CSSProperties}) => CSSProperties | undefined);
}

export interface RenderProps<T> extends StyleRenderProps<T> {
    children?:
        | React.ReactNode
        | ((values: T & {defaultChildren: React.ReactNode}) => React.ReactNode);
}

export interface RenderPropsOptions<T> extends RenderProps<T> {
    values: T;
    defaultChildren?: React.ReactNode;
    defaultClassName?: string;
    defaultStyle?: CSSProperties;
}

export function useRenderProps<T>({
    values,
    children,
    defaultChildren,
    className,
    defaultClassName,
    style,
    defaultStyle,
}: RenderPropsOptions<T>) {
    return React.useMemo(() => {
        let computedChildren: React.ReactNode;
        if (typeof children === 'function') {
            computedChildren = children({...values, defaultChildren});
        } else if (children === null) {
            computedChildren = defaultChildren;
        } else {
            computedChildren = children;
        }

        let computedClassName: string | undefined;
        if (typeof className === 'function') {
            computedClassName = className({...values, defaultClassName});
        } else {
            computedClassName = className;
        }

        let computedStyle: React.CSSProperties | undefined;
        if (typeof style === 'function') {
            computedStyle = style({...values, defaultStyle: defaultStyle ?? {}});
        } else {
            computedStyle = style;
        }

        return {
            children: computedChildren ?? defaultChildren,
            className: computedClassName ?? defaultClassName,
            style: computedStyle || defaultStyle ? {...defaultStyle, ...computedStyle} : undefined,
        };
    }, [values, children, defaultChildren, className, defaultClassName, style, defaultStyle]);
}
