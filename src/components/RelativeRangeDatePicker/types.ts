import type {DateTime} from '@gravity-ui/date-utils';

import type {Value} from '../RelativeDatePicker';
import type {
    AccessibilityProps,
    DomProps,
    FocusableProps,
    InputBase,
    InputDOMProps,
    PopupStyleProps,
    RangeValue,
    StyleProps,
    TextInputProps,
    Validation,
} from '../types';

import type {Preset} from './components/Presets/defaultPresets';
import type {PresetTab} from './components/Presets/utils';
import type {
    RelativeRangeDatePickerStateOptions,
    RelativeRangeDatePickerValue,
} from './hooks/useRelativeRangeDatePickerState';

export type RelativeRangeDatePickerTriggerProps = Pick<
    React.AllHTMLAttributes<HTMLElement>,
    | 'id'
    | 'role'
    | 'aria-controls'
    | 'aria-haspopup'
    | 'aria-expanded'
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-details'
    | 'onClick'
    | 'onKeyDown'
    | 'disabled'
    | 'readOnly'
>;

export interface RelativeRangeDatePickerRenderControlProps {
    ref: React.Ref<HTMLElement>;
    value: RelativeRangeDatePickerValue | null;
    title: string;
    errorMessage?: React.ReactNode;
    validationState?: 'invalid';
    open: boolean;
    setOpen: (open: boolean) => void;
    triggerProps: RelativeRangeDatePickerTriggerProps;
}

export interface RelativeRangeDatePickerProps
    extends RelativeRangeDatePickerStateOptions,
        DomProps,
        AccessibilityProps,
        InputBase,
        InputDOMProps,
        TextInputProps,
        Validation,
        FocusableProps,
        StyleProps,
        PopupStyleProps {
    /** Format of the date when rendered in the input. [Available formats](https://day.js.org/docs/en/display/format) */
    format?: string;
    /** A placeholder date that controls the default values of each segment when the user first interacts with them. Defaults to today's date at midnight. */
    placeholderValue?: DateTime;
    /** Apply changes with button */
    withApplyButton?: boolean;
    /** Show time zone selector */
    withZonesList?: boolean;
    /** Show relative range presets */
    withPresets?: boolean;
    /** Apply presets immediately */
    applyPresetsImmediately?: boolean;
    /** Show header with docs tooltip */
    withHeader?: boolean;
    /** Custom preset tabs */
    presetTabs?: PresetTab[];
    /** Custom docs for picker, if empty array docs will be hidden */
    docs?: Preset[];
    /** Show selected relative values as absolute dates */
    alwaysShowAsAbsolute?: boolean;
    /** */
    getRangeTitle?: (value: RangeValue<Value | null> | null, timeZone: string) => string;
    /** Handler that is called when the popup's open state changes. */
    onOpenChange?: (open: boolean) => void;
    /** Used to render control. */
    renderControl?: (props: RelativeRangeDatePickerRenderControlProps) => React.ReactElement;
}
