const PERIOD_LIKE_DATE_RE = /^now\s*-\s*/;
const RANGE_LIKE_STRING_RE = /^\d+[smhdwMy]$/;

export const isRangeLikeString = (range?: string) =>
    typeof range === 'string' && RANGE_LIKE_STRING_RE.test(range);

export const isPeriodLikeDate = (date: string | null | undefined) =>
    typeof date === 'string' && PERIOD_LIKE_DATE_RE.test(date);

export const extractPeriodFromRelativeDate = (date: string | null | undefined) =>
    typeof date === 'string' ? date.replace(PERIOD_LIKE_DATE_RE, '') : undefined;
