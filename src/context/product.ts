import { Model } from "@/model";
import { DebugContext } from "./debug";

export class ProductContext {
    private static readonly registry: Map<string, Function> = new Map();
    
    private static readonly registryInvert: Map<Function, string> = new Map();
    
    public static getType(code: string): any {
        return ProductContext.registry.get(code);
    }

    public static getCode(constructor: Function): string | undefined {
        return ProductContext.registryInvert.get(constructor);
    }

    public static create(chunk: Model.Chunk): Model | undefined {
        if (!chunk) return;
        const child: any = {};
        if (chunk?.child) {
            for (const key of Object.keys(chunk.child)) {
                const subChunk: Model.Chunk = Reflect.get(chunk.child, key);
                const value = ProductContext.create(subChunk)
                child[key] = chunk;
            }
        }
        const type = ProductContext.getType(chunk.code);
        const refer: any = {}
        return new type({
            uuid: chunk.uuid,
            state: chunk.state,
            child,
            refer
        })
    }

    private constructor() {}

    public static is<I extends string>(code: I) {
        return function (
            constructor: new (...args: any[]) => { code: I }
        ) {
            console.log('useProduct', constructor.name, code)
            ProductContext.registry.set(code, constructor);
            ProductContext.registryInvert.set(constructor, code);
        };
    }
}