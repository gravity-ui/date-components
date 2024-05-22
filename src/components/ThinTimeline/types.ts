export interface Period {
    /** Selected period start (millis from epoch) */
    start: number;
    /** Selected period end (millis from epoch) */
    end: number;
}

export interface RulerViewport {
    /** Ruler viewport start (millis from epoch) */
    viewportStart: number;
    /** Ruler viewport end (millis from epoch) */
    viewportEnd: number;
}

export interface HasHandlesProp {
    /**
     * If `false` handles are not shown and cannot be dragged.
     * Selection window will have bordered style
     */
    hasHandles?: boolean;
}

export interface RulerConfiguration extends RulerViewport, Period {}
