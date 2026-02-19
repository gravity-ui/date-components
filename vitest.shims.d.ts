/// <reference types="@vitest/browser-playwright" />

interface ImportMetaEnv {
    readonly VITE_CI: string;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
