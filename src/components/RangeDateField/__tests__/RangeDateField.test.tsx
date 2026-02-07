import {dateTime} from '@gravity-ui/date-utils';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';

import {render} from '#test-utils/utils';

import {RangeDateField} from '../RangeDateField';

describe('RangeDateField', () => {
    describe('invalid date', () => {
        it('should allow to enter 31 april - 31 april and constrains the range on blur', async () => {
            const onUpdate = vi.fn();
            const timeZone = 'Europe/Amsterdam';
            await render(
                <RangeDateField
                    format="DD.MM.YYYY"
                    placeholderValue={dateTime({input: '2024-04-15', timeZone})}
                    onUpdate={onUpdate}
                />,
            );
            await userEvent.keyboard('{Tab}');
            await userEvent.keyboard('3104202431042024');

            expect(onUpdate).not.toHaveBeenCalled();

            await userEvent.keyboard('{Tab}');

            const expectedStart = dateTime({input: '2024-04-30', timeZone});
            expect(onUpdate).toHaveBeenCalledWith({
                start: expectedStart.startOf('day'),
                end: expectedStart.endOf('day'),
            });
        });
    });
});
