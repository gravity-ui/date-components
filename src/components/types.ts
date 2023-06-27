export interface AccessibilityProps {
    /** The element's unique identifier. */
    id?: string;
    /** Defines a string value that labels the current element. */
    'aria-label'?: string;
    /** Identifies the element (or elements) that labels the current element. */
    'aria-labelledby'?: string;
    /** Identifies the element (or elements) that describes the object. */
    'aria-describedby'?: string;
    /** Identifies the element (or elements) that provide a detailed, extended description for the object. */
    'aria-details'?: string;
}

export interface KeyboardEvents {
    /** Handler that is called when a key is pressed. */
    onKeyDown?: (e: React.KeyboardEvent) => void;
    /** Handler that is called when a key is released. */
    onKeyUp?: (e: React.KeyboardEvent) => void;
}

export interface FocusEvents<Target = Element> {
    /** Handler that is called when the element receives focus. */
    onFocus?: (e: React.FocusEvent<Target>) => void;
    /** Handler that is called when the element loses focus. */
    onBlur?: (e: React.FocusEvent<Target>) => void;
}

export interface FocusableProps<Target = Element> extends FocusEvents<Target>, KeyboardEvents {
    /** Whether the element should receive focus on render. */
    autoFocus?: boolean;
}
