import React from 'react';

import type {RangeCalendarProps} from '../../Calendar';
import type {DateFieldBase, FocusableProps, TextInputProps} from '../../types';

import type {RelativeRangeDatepickerPresetTab} from './RelativeRangeDatepickerPresetTab';
import type {RelativeRangeDatepickerValue} from './RelativeRangeDatepickerValue';

export interface RelativeRangeDatepickerProps
    extends TextInputProps,
        DateFieldBase<RelativeRangeDatepickerValue>,
        FocusableProps {
    autoFocus?: boolean;
    alwaysShowAsAbsolute?: boolean;
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
    customControl?: React.ReactNode;
    label?: string;
    getRangeTitle?: (value: RelativeRangeDatepickerValue) => string | undefined;
    style?: React.CSSProperties;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onUpdateTimeZone?: (timeZone: string | undefined) => void;
}
