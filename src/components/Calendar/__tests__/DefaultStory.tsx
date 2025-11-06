import {dateTime} from '@gravity-ui/date-utils';

import {Calendar} from '../Calendar';

type Props = {
    date: Date;
};

export function DefaultStory({date}: Props) {
    const value = dateTime({input: date});

    return <Calendar value={value} />;
}
