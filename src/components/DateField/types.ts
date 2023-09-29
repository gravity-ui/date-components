export type DateFieldSectionType = Extract<
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
>;

export type DateFormatTokenMap = {
    [formatToken: string]:
        | DateFieldSectionType
        | {sectionType: DateFieldSectionType; contentType: 'digit' | 'letter'};
};

export interface DateFieldSection {
    value: number | undefined;
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
    /**
     * If `true`, the section value has been modified since the last time the sections were generated from a valid date.
     * When we can generate a valid date from the section, we don't directly pass it to `onChange`,
     * Otherwise, we would lose all the information contained in the original date, things like:
     * - time if the format does not contain it
     * - timezone / UTC
     *
     * To avoid losing that information, we transfer the values of the modified sections from the newly generated date to the original date.
     */
    modified: boolean;
    /**
     * Start index of the section in the format
     */
    start: number;
    /**
     * End index of the section in the format
     */
    end: number;

    previousEditableSection: number;
    nextEditableSection: number;
}

export type DateFieldSectionWithoutPosition<TSection extends DateFieldSection = DateFieldSection> =
    Omit<
        TSection,
        | 'start'
        | 'end'
        | 'value'
        | 'textValue'
        | 'modified'
        | 'previousEditableSection'
        | 'nextEditableSection'
    >;
