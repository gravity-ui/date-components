import {dateTime} from '@gravity-ui/date-utils';
import {beforeEach, describe, expect, it, vitest} from 'vitest';
import type {MockedFunction} from 'vitest';

import {renderHook} from '#test-utils/utils';

import {useDateFieldState} from '../hooks/useDateFieldState';
import {parseDateFromString} from '../utils';

vitest.mock('../utils', async () => ({
    ...(await vitest.importActual('../utils')),
    parseDateFromString: vitest.fn(),
}));

const mockedParseDateFromString = parseDateFromString as MockedFunction<typeof parseDateFromString>;

describe('DateField: parseDateFromString', () => {
    beforeEach(() => {
        vitest.clearAllMocks();
        mockedParseDateFromString.mockImplementation((str, format, timeZone) => {
            return dateTime({input: str, format, timeZone});
        });
    });

    it('should call custom parseDateFromString when provided', async () => {
        const customParser = vitest.fn().mockReturnValue(dateTime({input: '2024-01-15T00:00:00Z'}));

        const {result, act} = await renderHook(() =>
            useDateFieldState({
                format: 'DD.MM.YYYY',
                parseDateFromString: customParser,
            }),
        );

        act(() => {
            result.current.setValueFromString('15.01.2024');
        });

        expect(customParser).toHaveBeenCalledWith('15.01.2024', 'DD.MM.YYYY', 'default');
        expect(mockedParseDateFromString).not.toHaveBeenCalled();
    });

    it('should use default parseDateFromString when parseDateFromString is not provided', async () => {
        const validDate = dateTime({input: '2024-01-15T00:00:00Z'});
        mockedParseDateFromString.mockReturnValue(validDate);

        const {result, act} = await renderHook(() => useDateFieldState({format: 'DD.MM.YYYY'}));

        act(() => {
            result.current.setValueFromString('15.01.2024');
        });

        expect(mockedParseDateFromString).toHaveBeenCalledWith(
            '15.01.2024',
            'DD.MM.YYYY',
            'default',
        );
    });
});
