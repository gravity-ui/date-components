export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const MONTH = 30 * DAY;
export const YEAR = 365 * DAY;

const platform =
    typeof window !== 'undefined' && window.navigator
        ? // @ts-expect-error
          window.navigator['userAgentData']?.platform || window.navigator.platform
        : '';

export const isMac = /^Mac/i.test(platform);
export const CtrlCmd = isMac ? 'metaKey' : 'ctrlKey';
