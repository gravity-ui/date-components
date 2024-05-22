import {getDurationFromValue, getHighestRoundedDuration} from './duration';

describe('Testing getDurationFromValue', () => {
    test('Get correct values from timestamps', () => {
        expect(getDurationFromValue(0)).toEqual({y: 0, M: 0, w: 0, d: 0, h: 0, m: 0, s: 0});
        expect(getDurationFromValue(13000)).toEqual({y: 0, M: 0, w: 0, d: 0, h: 0, m: 0, s: 13});
        expect(getDurationFromValue(59543)).toEqual({y: 0, M: 0, w: 0, d: 0, h: 0, m: 0, s: 59});
        expect(getDurationFromValue(145345)).toEqual({y: 0, M: 0, w: 0, d: 0, h: 0, m: 2, s: 25});
        expect(getDurationFromValue(3540999)).toEqual({y: 0, M: 0, w: 0, d: 0, h: 0, m: 59, s: 0});
        expect(getDurationFromValue(4485000)).toEqual({y: 0, M: 0, w: 0, d: 0, h: 1, m: 14, s: 45});
        expect(getDurationFromValue(164279000)).toEqual({
            y: 0,
            M: 0,
            w: 0,
            d: 1,
            h: 21,
            m: 37,
            s: 59,
        });
        expect(getDurationFromValue(518399000)).toEqual({
            y: 0,
            M: 0,
            w: 0,
            d: 5,
            h: 23,
            m: 59,
            s: 59,
        });
        expect(getDurationFromValue(710085000)).toEqual({
            y: 0,
            M: 0,
            w: 1,
            d: 1,
            h: 5,
            m: 14,
            s: 45,
        });
        expect(getDurationFromValue(2715914000)).toEqual({
            y: 0,
            M: 1,
            w: 0,
            d: 1,
            h: 10,
            m: 25,
            s: 14,
        });
        expect(getDurationFromValue(81705600000)).toEqual({
            y: 2,
            M: 7,
            w: 0,
            d: 5,
            h: 16,
            m: 0,
            s: 0,
        });
    });

    test('Handling unexpected inputs', () => {
        //@ts-ignore
        expect(getDurationFromValue()).toEqual({y: 0, M: 0, w: 0, d: 0, h: 0, m: 0, s: 0});
        //@ts-ignore
        expect(getDurationFromValue('fail')).toEqual({y: 0, M: 0, w: 0, d: 0, h: 0, m: 0, s: 0});
        expect(getDurationFromValue(Infinity)).toEqual({y: 0, M: 0, w: 0, d: 0, h: 0, m: 0, s: 0});
        expect(getDurationFromValue(-14000)).toEqual({y: 0, M: 0, w: 0, d: 0, h: 0, m: 0, s: 14});
    });
});

describe('Testing getHighestRoundedDuration', () => {
    test('Seconds', () => {
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 0, d: 0, h: 0, m: 0, s: 0})).toEqual('0s');
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 0, d: 0, h: 0, m: 0, s: 14})).toEqual(
            '14s',
        );
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 0, d: 0, h: 0, m: 0, s: 59})).toEqual(
            '59s',
        );
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 0, d: 0, h: 0, m: 0, s: 60})).toEqual(
            '60s',
        );
    });

    test('Minutes', () => {
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 0, d: 0, h: 0, m: 1, s: 0})).toEqual('1m');
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 0, d: 0, h: 0, m: 1, s: 23})).toEqual(
            '1m',
        );
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 0, d: 0, h: 0, m: 59, s: 59})).toEqual(
            '59m',
        );
    });

    test('Hours', () => {
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 0, d: 0, h: 1, m: 14, s: 25})).toEqual(
            '74m',
        );
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 0, d: 0, h: 22, m: 59, s: 59})).toEqual(
            '1379m',
        );
    });

    test('Days', () => {
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 0, d: 1, h: 5, m: 35, s: 25})).toEqual(
            '29h',
        );
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 0, d: 14, h: 22, m: 59, s: 59})).toEqual(
            '358h',
        );
    });

    test('Weeks', () => {
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 2, d: 1, h: 5, m: 35, s: 25})).toEqual(
            '15d',
        );
        expect(getHighestRoundedDuration({y: 0, M: 0, w: 10, d: 2, h: 1, m: 0, s: 0})).toEqual(
            '72d',
        );
    });

    test('Months', () => {
        expect(getHighestRoundedDuration({y: 0, M: 1, w: 3, d: 29, h: 10, m: 0, s: 0})).toEqual(
            '7w',
        );
    });

    test('Years', () => {
        expect(getHighestRoundedDuration({y: 2, M: 11, w: 3, d: 29, h: 10, m: 0, s: 0})).toEqual(
            '35M',
        );
    });

    test('Handling unexpected inputs', () => {
        expect(getHighestRoundedDuration()).toEqual('0s');
        //@ts-ignore
        expect(getHighestRoundedDuration('')).toEqual('0s');
        //@ts-ignore
        expect(getHighestRoundedDuration('haha')).toEqual('0s');
        //@ts-ignore
        expect(getHighestRoundedDuration(34)).toEqual('0s');
    });
});
