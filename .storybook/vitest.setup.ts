import {beforeAll, expect} from 'vitest';
import type {ExpectStatic} from 'vitest';

declare global {
    var vitestExpect: ExpectStatic | undefined;
}

beforeAll(() => {
    globalThis.vitestExpect = expect;
});
