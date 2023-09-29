import React from 'react';

import {jest} from '@jest/globals';
import {act, render, renderHook, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {useControlledState} from './useControlledState.js';

describe('useControlledState tests', function () {
    it('can handle default setValue behavior, wont invoke onChange for the same value twice in a row', () => {
        const onChangeSpy = jest.fn();
        const {result} = renderHook(() =>
            useControlledState(undefined, 'defaultValue', onChangeSpy),
        );
        let [value, setValue] = result.current;
        expect(value).toBe('defaultValue');
        expect(onChangeSpy).not.toHaveBeenCalled();
        act(() => setValue('newValue'));
        [value, setValue] = result.current;
        expect(value).toBe('newValue');
        expect(onChangeSpy).toHaveBeenLastCalledWith('newValue');

        act(() => setValue('newValue2'));
        [value, setValue] = result.current;
        expect(value).toBe('newValue2');
        expect(onChangeSpy).toHaveBeenLastCalledWith('newValue2');

        onChangeSpy.mockClear();

        act(() => setValue('newValue2'));
        [value, setValue] = result.current;
        expect(value).toBe('newValue2');
        expect(onChangeSpy).not.toHaveBeenCalled();

        // it should call onChange with a new but not immediately previously run value
        act(() => setValue('newValue'));
        [value, setValue] = result.current;
        expect(value).toBe('newValue');
        expect(onChangeSpy).toHaveBeenLastCalledWith('newValue');
    });

    it('using NaN will only trigger onChange once', () => {
        const onChangeSpy = jest.fn();
        const {result} = renderHook(() =>
            useControlledState<number | undefined, number>(undefined, undefined, onChangeSpy),
        );
        let [value, setValue] = result.current;
        expect(value).not.toBeDefined();
        expect(onChangeSpy).not.toHaveBeenCalled();
        act(() => setValue(NaN));
        [value, setValue] = result.current;
        expect(value).toBe(NaN);
        expect(onChangeSpy).toHaveBeenCalledTimes(1);
        expect(onChangeSpy).toHaveBeenLastCalledWith(NaN);

        act(() => setValue(NaN));
        [value, setValue] = result.current;
        expect(value).toBe(NaN);
        expect(onChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('does not trigger too many renders', async () => {
        const renderSpy = jest.fn<() => void>();

        const TestComponent = (props: any) => {
            const [state, setState] = useControlledState(
                props.value,
                props.defaultValue,
                props.onChange,
            );
            React.useEffect(() => renderSpy(), [state]);
            return <button onClick={() => setState(state + 1)} data-qa={state} />;
        };

        const TestComponentWrapper = (props: any) => {
            const [state, setState] = React.useState(props.defaultValue);
            return <TestComponent onChange={(value: any) => setState(value)} value={state} />;
        };

        render(<TestComponentWrapper defaultValue={5} />);
        const button = screen.getByRole('button');
        screen.getByTestId('5');
        expect(renderSpy).toBeCalledTimes(1);
        await userEvent.click(button);
        screen.getByTestId('6');
        expect(renderSpy).toBeCalledTimes(2);
    });

    it('can handle controlled setValue behavior', () => {
        const onChangeSpy = jest.fn();
        const {result} = renderHook(() =>
            useControlledState('controlledValue', 'defaultValue', onChangeSpy),
        );
        let [value, setValue] = result.current;
        expect(value).toBe('controlledValue');
        expect(onChangeSpy).not.toHaveBeenCalled();

        act(() => setValue('newValue'));
        [value, setValue] = result.current;
        expect(value).toBe('controlledValue');
        expect(onChangeSpy).toHaveBeenLastCalledWith('newValue');

        onChangeSpy.mockClear();

        act(() => setValue('controlledValue'));
        [value, setValue] = result.current;
        expect(value).toBe('controlledValue');
        expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it('will console warn if the programmer tries to switch from controlled to uncontrolled', () => {
        const onChangeSpy = jest.fn();
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const {result, rerender} = renderHook(
            ({value, defaultValue, onChange}) => useControlledState(value, defaultValue, onChange),
            {
                initialProps: {
                    value: 'controlledValue',
                    defaultValue: 'defaultValue',
                    onChange: onChangeSpy,
                },
            },
        );
        const [value] = result.current;
        expect(value).toBe('controlledValue');
        expect(onChangeSpy).not.toHaveBeenCalled();
        // @ts-expect-error
        rerender({value: undefined, defaultValue: 'defaultValue', onChange: onChangeSpy});
        expect(consoleWarnSpy).toHaveBeenLastCalledWith(
            'WARN: A component changed from controlled to uncontrolled.',
        );
    });

    it('will console warn if the programmer tries to switch from uncontrolled to controlled', () => {
        const onChangeSpy = jest.fn();
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const {result, rerender} = renderHook(
            ({value, defaultValue, onChange}) => useControlledState(value, defaultValue, onChange),
            {
                initialProps: {
                    value: undefined,
                    defaultValue: 'defaultValue',
                    onChange: onChangeSpy,
                },
            },
        );
        const [value] = result.current;
        expect(value).toBe('defaultValue');
        expect(onChangeSpy).not.toHaveBeenCalled();
        // @ts-expect-error
        rerender({value: 'controlledValue', defaultValue: 'defaultValue', onChange: onChangeSpy});
        expect(consoleWarnSpy).toHaveBeenLastCalledWith(
            'WARN: A component changed from uncontrolled to controlled.',
        );
    });
});
