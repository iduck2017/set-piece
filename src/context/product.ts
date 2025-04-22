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

}