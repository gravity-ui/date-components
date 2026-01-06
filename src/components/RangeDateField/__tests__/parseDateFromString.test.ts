import {dateTime} from '@gravity-ui/date-utils';
import {beforeEach, describe, expect, it, vitest} from 'vitest';
import type {MockedFunction} from 'vitest';

import {renderHook} from '#test-utils/utils';

import {parseDateFromString} from '../../DateField/utils';
import {useRangeDateFieldState} from '../hooks/useRangeDateFieldState';

vitest.mock('../../DateField/utils', async () => ({
    ...(await vitest.importActual('../../DateField/utils')),
    parseDateFromString: vitest.fn(),
}));

const mockedParseDateFromString = parseDateFromString as MockedFunction<typeof parseDateFromString>;

describe('RangeDateField: parseDateFromString', () => {
    beforeEach(() => {
        vitest.clearAllMocks();
        mockedParseDateFromString.mockImplementation((str, format, timeZone) => {
            return dateTime({input: str, format, timeZone});
        });
    });

    it('should call custom parseDateFromString when provided for range dates', async () => {
        const customParser = vitest
            .fn()
            .mockReturnValueOnce(dateTime({input: '2024-01-15T00:00:00Z'}))
            .mockReturnValueOnce(dateTime({input: '2024-01-20T00:00:00Z'}));

        const {result, act} = await renderHook(() =>
            useRangeDateFieldState({
                format: 'DD.MM.YYYY',
                parseDateFromString: customParser,
            }),
        );

        act(() => {
            result.current.setValueFromString('15.01.2024 — 20.01.2024');
        });

        expect(customParser).toHaveBeenCalledTimes(2);
        expect(customParser).toHaveBeenNthCalledWith(1, '15.01.2024', 'DD.MM.YYYY', 'default');
        expect(customParser).toHaveBeenNthCalledWith(2, '20.01.2024', 'DD.MM.YYYY', 'default');
        expect(mockedParseDateFromString).not.toHaveBeenCalled();
    });

    it('should use default parseDateFromString when parseDateFromString is not provided', async () => {
        const validStartDate = dateTime({input: '2024-01-15T00:00:00Z'});
        const validEndDate = dateTime({input: '2024-01-20T00:00:00Z'});
        mockedParseDateFromString
            .mockReturnValueOnce(validStartDate)
            .mockReturnValueOnce(validEndDate);

        const {result, act} = await renderHook(() =>
            useRangeDateFieldState({format: 'DD.MM.YYYY'}),
        );

        act(() => {
            result.current.setValueFromString('15.01.2024 — 20.01.2024');
        });

        expect(mockedParseDateFromString).toHaveBeenCalledTimes(2);
        expect(mockedParseDateFromString).toHaveBeenNthCalledWith(
            1,
            '15.01.2024',
            'DD.MM.YYYY',
            'default',
        );
        expect(mockedParseDateFromString).toHaveBeenNthCalledWith(
            2,
            '20.01.2024',
            'DD.MM.YYYY',
            'default',
        );
    });
});
