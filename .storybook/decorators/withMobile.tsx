import React from 'react';

import {useMobile} from '@gravity-ui/uikit';
import type {Decorator} from '@storybook/react';

export const WithMobile: Decorator = (Story, context) => {
    const mobileValue = context.globals.platform === 'mobile';

    const [, setMobile] = useMobile();

    React.useEffect(() => {
        setMobile(mobileValue);
    }, [mobileValue, setMobile]);

    return <Story {...context} />;
};
