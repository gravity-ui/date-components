import {createSuggestValues} from './createSuggestValues';

describe('Testing createSuggestValues', () => {
    test('Get correct values with default limit (2y)', () => {
        expect(createSuggestValues('2y', '1')).toEqual(['1s', '1m', '1h', '1d', '1w', '1M', '1y']);
        expect(createSuggestValues('2y', '1y')).toEqual(['1y']);
    });
    test('Get correct values with custom limit', () => {
        expect(createSuggestValues('1d', '1')).toEqual(['1s', '1m', '1h', '1d']);
        expect(createSuggestValues('1d', '2')).toEqual(['2s', '2m', '2h']);
        expect(createSuggestValues('1d', '1d')).toEqual(['1d']);
        expect(createSuggestValues('1d', '2d')).toEqual([]);
        expect(createSuggestValues('1d', '100m')).toEqual(['100m']);
    });
});
