import React from 'react';

import type {RangeCalendarProps} from '../../Calendar';
import type {DateFieldBase, FocusableProps, TextInputProps} from '../../types';

import type {RelativeRangeDatepickerPresetTab} from './RelativeRangeDatepickerPresetTab';
import type {RelativeRangeDatepickerValue} from './RelativeRangeDatepickerValue';

export interface RelativeRangeDatepickerProps
    extends TextInputProps,
        DateFieldBase<RelativeRangeDatepickerValue>,
        FocusableProps {
    children?: (props: RangeCalendarProps) => React.ReactNode;
    onError?: () => void;
    allowNullableValues?: boolean;
    alwaysShowAsAbsolute?: boolean;
    withTime?: boolean;
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
