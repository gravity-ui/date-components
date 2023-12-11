import type {DateTime} from '@gravity-ui/date-utils';

export type RangeDatepickerSingleValue =
    | {
          type: 'absolute';
          value: DateTime;
      }
    | {
          type: 'relative';
          value: string;
      }
    | null;
