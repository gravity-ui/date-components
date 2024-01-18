import {dateTime} from '@gravity-ui/date-utils';

export function getTimeZoneOffset(timeZone: string) {
    return `UTC${dateTime({timeZone}).format('Z')}`;
}
