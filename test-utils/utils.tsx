import {MobileProvider, ThemeProvider} from '@gravity-ui/uikit';
import {render, renderHook} from 'vitest-browser-react';
import type {ComponentRenderOptions} from 'vitest-browser-react';

interface ProvidersProps {
    theme?: string;
    lang?: string;
    mobile?: boolean;
}

function Providers({
    children,
    theme = 'light',
    lang,
    mobile,
}: {children: React.ReactNode} & ProvidersProps) {
    return (
        <ThemeProvider theme={theme} lang={lang}>
            <MobileProvider mobile={mobile}>{children}</MobileProvider>
        </ThemeProvider>
    );
}

function createWrapper(
    providers?: ProvidersProps,
    Component?: React.JSXElementConstructor<{children: React.ReactNode}>,
) {
    return function Wrapper({children}: {children: React.ReactNode}) {
        return (
            <Providers {...providers}>
                {Component ? <Component>{children}</Component> : children}
            </Providers>
        );
    };
}

function customRender(
    ui: React.ReactElement,
    {
        providers,
        ...options
    }: ComponentRenderOptions & {
        providers?: {theme?: string; lang?: string; mobile?: boolean};
    } = {},
) {
    const wrapper = createWrapper(providers, options.wrapper);
    return render(ui, {...options, wrapper});
}

export {customRender as render, renderHook};
