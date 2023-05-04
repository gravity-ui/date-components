import {Lang, configure} from '@gravity-ui/uikit';
import type {Decorator} from '@storybook/react';

export const withLang: Decorator = (Story, context) => {
    const lang = context.globals.lang;

    configure({
        lang: lang as Lang,
    });

    return <Story key={lang} {...context} />;
};
