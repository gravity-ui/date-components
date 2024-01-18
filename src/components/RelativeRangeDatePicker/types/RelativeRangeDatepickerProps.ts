import React from 'react';

import type {RangeCalendarProps} from '../../Calendar';
import type {DateFieldBase, FocusableProps, TextInputProps, Validation} from '../../types';

import type {RelativeRangeDatepickerPresetTab} from './RelativeRangeDatepickerPresetTab';
import type {RelativeRangeDatepickerValue} from './RelativeRangeDatepickerValue';

export interface RelativeRangeDatepickerProps
    extends TextInputProps,
        Omit<DateFieldBase<RelativeRangeDatepickerValue>, keyof Validation>,
        FocusableProps {
    onUpdateTimeZone?: (timeZone?: string) => void;
    children?: (props: RangeCalendarProps) => React.ReactNode;
    allowNullableValues?: boolean;
    withTimePresets?: boolean;
    withPresets?: boolean;
    presetTabs?: RelativeRangeDatepickerPresetTab[];
    withZonesList?: boolean;
    withApplyButton?: boolean;
    hasClear?: boolean;
    hasCalendarIcon?: boolean;
    disabled?: boolean;
    customControl?: () => React.ReactNode;
    label?: string;
    getRangeTitle?: (value: RelativeRangeDatepickerValue) => string | undefined;
}
