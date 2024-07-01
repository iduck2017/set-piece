import type { App } from './app';

declare global {
    interface Window {
        _app: App;
    }
}

export {};