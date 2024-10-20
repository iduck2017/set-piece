import type { App } from './app';

declare global {
    interface Window { _app: App; }
    interface Object {
        format<
            T extends string,
            A extends Record<T, any>,
            B extends Record<T, any>,
        >(
            this: A,
            formatValue: <K extends T>(value: A[K]) => B[K], 
        ): B;
    }
}