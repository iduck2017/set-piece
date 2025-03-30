export declare class ProductContext {
    private static products;
    static query(code: string): any;
    private constructor();
    static as<I extends string>(code: I): (constructor: new (...args: any[]) => {
        code: I;
    }) => void;
    private static uuids;
    static register(uuid?: string): string;
    static unregister(uuid: string): void;
}
