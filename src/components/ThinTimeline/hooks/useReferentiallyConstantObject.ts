import React from 'react';

export const useReferentiallyConstantObject = <T extends object>(value: T) => {
    const ref = React.useRef(value);
    Object.assign(ref.current, value);
    return ref.current;
};
