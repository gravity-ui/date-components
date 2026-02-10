export type DateFieldSectionType =
    | Extract<
          Intl.DateTimeFormatPartTypes,
          | 'day'
          | 'dayPeriod'
          | 'hour'
          | 'literal'
          | 'minute'
          | 'month'
          | 'second'
          | 'timeZoneName'
          | 'weekday'
          | 'year'
          | 'unknown'
      >
    | 'quarter';

export type DateFormatTokenMap = {
    [formatToken: string]:
        | DateFieldSectionType
        | {sectionType: DateFieldSectionType; contentType: 'digit' | 'letter'};
};

export interface DateFieldSection {
    value: number | null;
    /**
     * Value of the section, as rendered inside the input.
     * For example, in the date `May 25, 1995`, the value of the month section is "May".
     */
    textValue: string;
    /**
     * Format token used to parse the value of this section from the date object.
     * For example, in the format `MMMM D, YYYY`, the format of the month section is "MMMM".
     */
    format: string;
    /**
     * Placeholder rendered when the value of this section is empty.
     */
    placeholder: string;
    /**
     * Type of the section.
     */
    type: DateFieldSectionType;
    /**
     * Type of content of the section.
     * Will determine if we should apply a digit-based editing or a letter-based editing.
     */
    contentType: 'digit' | 'letter';
    /**
     * Available values
     */
    options?: string[];
    /** The minimum numeric value for the segment, if applicable. */
    minValue?: number;
    /** The maximum numeric value for the segment, if applicable. */
    maxValue?: number;
    /**
     * If `true`, the value of this section is supposed to have leading zeroes.
     * For example, the value `1` should be rendered as "01" instead of "1".
     */
    hasLeadingZeros: boolean;
}

export type FormatSection<TSection extends DateFieldSection = DateFieldSection> = Omit<
    TSection,
    'value' | 'textValue'
>;

export type AvailableSections = Partial<Record<DateFieldSectionType, boolean>>;

export interface FormatInfo {
    hasTime: boolean;
    hasDate: boolean;
    availableUnits: AvailableSections;
    minDateUnit: 'day' | 'month' | 'quarter' | 'year';
    minTimeUnit: 'second' | 'minute' | 'hour';
}
