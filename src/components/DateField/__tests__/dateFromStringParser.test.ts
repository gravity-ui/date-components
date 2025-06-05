import {dateTime} from '@gravity-ui/date-utils';
import {act, renderHook} from '@testing-library/react';

import {useDateFieldState} from '../hooks/useDateFieldState';
import {parseDateFromString} from '../utils';

jest.mock('../utils', () => ({
    ...jest.requireActual('../utils'),
    parseDateFromString: jest.fn(),
}));

const mockedParseDateFromString = parseDateFromString as jest.MockedFunction<
    typeof parseDateFromString
>;

describe('DateField: dateFromStringParser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedParseDateFromString.mockImplementation((str, format, timeZone) => {
            return dateTime({input: str, format, timeZone});
        });
    });

    it('should call custom dateFromStringParser when provided', () => {
        const customParser = jest.fn().mockReturnValue(dateTime({input: '2024-01-15T00:00:00Z'}));

        const {result} = renderHook(() =>
            useDateFieldState({
                format: 'DD.MM.YYYY',
                dateFromStringParser: customParser,
            }),
        );

        act(() => {
            result.current.setValueFromString('15.01.2024');
        });

        expect(customParser).toHaveBeenCalledWith('15.01.2024', 'DD.MM.YYYY', 'default');
        expect(mockedParseDateFromString).not.toHaveBeenCalled();
    });

    it('should use default parseDateFromString when dateFromStringParser is not provided', () => {
        const validDate = dateTime({input: '2024-01-15T00:00:00Z'});
        mockedParseDateFromString.mockReturnValue(validDate);

        const {result} = renderHook(() => useDateFieldState({format: 'DD.MM.YYYY'}));

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
