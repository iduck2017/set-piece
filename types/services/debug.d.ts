type Callback<R = any, P extends any[] = any[]> = (...args: P) => R;
export declare enum LogLevel {
    INFO = 0,
    WARN = 1,
    ERROR = 2
}
export declare class DebugContext {
    private static readonly stack;
    static useStack(options?: {
        useArgs?: boolean;
        useResult?: boolean;
    }): (target: Object, key: string, descriptor: TypedPropertyDescriptor<Callback>) => TypedPropertyDescriptor<Callback>;
    static useMute(): (target: Object, key: string, descriptor: TypedPropertyDescriptor<Callback>) => TypedPropertyDescriptor<Callback>;
    private static readonly levels;
    static useLevel(level: LogLevel): (constructor: Function) => void;
    private static get indent();
    private static get namespace();
    private constructor();
}
export {};
