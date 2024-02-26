import type {
    TextInputProps as TextInputBaseProps,
    TextInputPin,
    TextInputSize,
    TextInputView,
} from '@gravity-ui/uikit';

export type ValidationState = 'invalid';

export interface AccessibilityProps {
    /** Defines a string value that labels the current element. */
    'aria-label'?: string;
    /** Identifies the element (or elements) that labels the current element. */
    'aria-labelledby'?: string;
    /** Identifies the element (or elements) that describes the object. */
    'aria-describedby'?: string;
    /** Identifies the element (or elements) that provide a detailed, extended description for the object. */
    'aria-details'?: string;
}

export interface ValueBase<T, C = T> {
    /** The current value (controlled). */
    value?: T;
    /** The default value (uncontrolled). */
    defaultValue?: T;
    /** Handler that is called when the value changes. */
    onUpdate?: (value: C) => void;
}

export interface Validation
    extends Pick<TextInputBaseProps, 'validationState' | 'errorMessage' | 'errorPlacement'> {}

export interface DomProps {
    /** The element's unique identifier. */
    id?: string;
}

export interface InputDOMProps {
    /**
     * The name of the input element, used when submitting an HTML form.
     */
    name?: string;
}
export interface InputBase {
    /**
     * Whether the field is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * Whether the calendar value is immutable.
     * @default false
     */
    readOnly?: boolean;
}

export interface TextInputProps {
    /** The size of the element */
    size?: TextInputSize;
    /**
     * Corner rounding
     * @default 'round-round'
     */
    pin?: TextInputPin;
    /** Control view */
    view?: TextInputView;
    /** Inner field label */
    label?: TextInputBaseProps['label'];
    /** Text that appears in the field when it has no value set */
    placeholder?: string;
    /**
     * Show clear button
     * @default false
     */
    hasClear?: boolean;
}

export interface TextInputExtendProps {
    /**
     * User`s node rendered before label and input
     */
    startContent?: TextInputBaseProps['startContent'];
    /**
     * User`s node rendered after input and clear button
     */
    endContent?: TextInputBaseProps['endContent'];
}

export interface RangeValue<T> {
    /** The start value of the range. */
    start: T;
    /** The end value of the range. */
    end: T;
}
