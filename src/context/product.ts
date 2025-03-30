import { DebugContext } from "./debug";

export class ProductContext {
    private static constructors: Map<string, any> = new Map();
    
    static query(code: string) {
        return ProductContext.constructors.get(code);
    }

    private constructor() {}

    static is<I extends string>(code: I) {
        return function (
            constructor: new (...args: any[]) => { code: I }
        ) {
            console.log('useProduct', constructor.name, code)
            ProductContext.constructors.set(code, constructor);
        };
    }

    private static uuids: Set<string> = new Set();
    
    @DebugContext.log()
    static registerId(uuid?: string) {
        if (!uuid) uuid = crypto.randomUUID();
        while (ProductContext.uuids.has(uuid)) {
            console.log('duplicateUUID', uuid);
            uuid = crypto.randomUUID();
        }
        ProductContext.uuids.add(uuid)
        return uuid;
    }

    @DebugContext.log()
    static unregisterId(uuid: string) {
        ProductContext.uuids.delete(uuid)
    }
}