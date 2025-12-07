import {ThemeProvider} from '@gravity-ui/uikit';
import {render, renderHook} from 'vitest-browser-react';
import type {ComponentRenderOptions} from 'vitest-browser-react';

function Providers({children}: {children: React.ReactNode}) {
    return <ThemeProvider theme="light">{children}</ThemeProvider>;
}

function createWrapper(Component: React.JSXElementConstructor<{children: React.ReactNode}>) {
    return function Wrapper({children}: {children: React.ReactNode}) {
        return (
            <Providers>
                <Component>{children}</Component>
            </Providers>
        );
    };
}

function customRender(ui: React.ReactElement, options?: ComponentRenderOptions) {
    const wrapper = options?.wrapper ? createWrapper(options.wrapper) : Providers;
    return render(ui, {...options, wrapper});
}

export {customRender as render, renderHook};
