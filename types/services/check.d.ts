type Callback<R = any, P extends any[] = any[]> = (...args: P) => R;
export declare class CheckService {
    private static readonly validators;
    static if<T extends Object, R = any, P extends any[] = any[]>(validator: (target: T, ...args: P) => any, error?: string | Error): (target: T, key: string, descriptor: TypedPropertyDescriptor<Callback<R | undefined, P>>) => TypedPropertyDescriptor<Callback<R | undefined, P>>;
    static precheck<F extends Callback>(target: Object, method: F, ...args: Parameters<F>): boolean;
}
export {};
