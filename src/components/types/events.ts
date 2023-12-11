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

export interface FocusableProps<Target = Element> extends FocusEvents<Target> {
    /**
     *  Whether the element should receive focus on render.
     *  TODO: The autoFocus prop should not be used, as it can reduce usability and accessibility for users
     *  */
    autoFocus?: boolean;
}
