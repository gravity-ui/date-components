export interface Geometry {
    (x: number): string;
}

interface MakeTicksOptions {
    tickHeight: number;
    viewportHeight: number;
}
export function makeMiddleTicksGeometry({tickHeight, viewportHeight}: MakeTicksOptions): Geometry {
    const tickYStart = (viewportHeight - tickHeight) / 2;
    return (x) => `M${x},${tickYStart}l0,${tickHeight}`;
}

export function makeSlitTicksGeometry({tickHeight, viewportHeight}: MakeTicksOptions): Geometry {
    const slitHeight = viewportHeight - 2 * tickHeight;
    return (x) => `M${x},0l0,${tickHeight}m0,${slitHeight}l0,${tickHeight}`;
}
