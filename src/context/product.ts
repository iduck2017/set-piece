import { DebugContext } from "./debug";

export class ProductContext {
    private static registry: Map<string, any> = new Map();
    
    static query(code: string) {
        return ProductContext.registry.get(code);
    }

    private constructor() {}

    static is<I extends string>(code: I) {
        return function (
            constructor: new (...args: any[]) => { code: I }
        ) {
            console.log('useProduct', constructor.name, code)
            ProductContext.registry.set(code, constructor);
        };
    }

    private static uuids: Set<string> = new Set();
    
    @DebugContext.log()
    static checkUUID(uuid?: string) {
        if (!uuid) uuid = crypto.randomUUID();
        while (ProductContext.uuids.has(uuid)) {
            console.log('duplicateUUID', uuid);
            uuid = crypto.randomUUID();
        }
        ProductContext.uuids.add(uuid)
        return uuid;
    }

    @DebugContext.log()
    static deleteUUID(uuid: string) {
        ProductContext.uuids.delete(uuid)
    }
}