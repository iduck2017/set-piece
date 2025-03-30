export declare class StoreContext {
    private static types;
    private static codes;
    private constructor();
    static useProduct<I extends string>(code: I): (constructor: new (...args: any[]) => {
        code: I;
    }) => void;
    private static uuids;
    static getType(code: string): any;
    static getUUID(uuid?: string): string;
    static deleteUUID(uuid: string): void;
}
