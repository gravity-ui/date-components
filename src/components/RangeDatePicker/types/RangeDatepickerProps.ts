import React from 'react';

import type {RangeCalendarProps} from '../../Calendar';
import type {DateFieldBase, FocusableProps, TextInputProps} from '../../types';

import type {RangeDatepickerPresetTab} from './RangeDatepickerPresetTab';
import type {RangeDatepickerValue} from './RangeDatepickerValue';

export interface RangeDatepickerProps
    extends TextInputProps,
        DateFieldBase<RangeDatepickerValue>,
        FocusableProps {
    children?: (props: RangeCalendarProps) => React.ReactNode;
    onError?: () => void;
    allowNullableValues?: boolean;
    alwaysShowAsAbsolute?: boolean;
    withTime?: boolean;
    withPresets?: boolean;
    presetTabs?: RangeDatepickerPresetTab[];
    withZonesList?: boolean;
    withApplyButton?: boolean;
    hasClear?: boolean;
    hasCalendarIcon?: boolean;
    disabled?: boolean;
    customControl?: () => React.ReactNode;
    label?: string;
    getRangeTitle?: (value: RangeDatepickerValue) => string | undefined;
}
