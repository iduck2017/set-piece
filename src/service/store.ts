import { Model } from "@/model";
import { Value } from "@/types";

interface Chunk {
    uuid?: string,
    code: string,
    state: Record<string, Value>,
    child: Record<string, Chunk>,
    refer: Record<string, string | string[]>
}

export class StoreService {
    private static readonly registry: Map<string, any> = new Map();
    
    private static readonly registryInvert: Map<Function, string> = new Map();
    
    public static save(model: Model): Chunk | undefined {
        const props = {
            child: {},
            refer: {},
            ...model.props,
        };
        const code = StoreService.registryInvert.get(model.constructor);
        if (!code) return undefined;
        const result: Chunk = {
            code,
            uuid: props.uuid,
            state: props.state ?? {},
            child: {},
            refer: {},
        }
        for (const key of Object.keys(props.child)) {
            const value = Reflect.get(props.child, key);
            if (!value) continue;
            const chunk = StoreService.save(value);
            if (chunk) result.child[key] = chunk;
        }
        for (const key of Object.keys(props.refer)) {
            const value = Reflect.get(props.refer, key);
            if (value instanceof Model) result.refer[key] = value.uuid;
            if (value instanceof Array) result.refer[key] = value.map(model => model?.uuid);
        }
        return result;
    }

    public static load(chunk: Chunk): Model | undefined {
        const type = StoreService.registry.get(chunk.code);
        if (!type) return undefined;
        const child: Record<string, Model> = {};
        for (const key of Object.keys(chunk.child)) {
            const value = StoreService.load(chunk.child[key]);
            if (value) child[key] = value;
        }
        const result = new type({
            uuid: chunk.uuid,
            state: chunk.state,
            child,
            refer: chunk.refer,
        })
        return result;
    }




    private constructor() {}

    public static is<I extends string, M extends Model>(code: I) {
        return function (
            constructor: new (props: Model.Props<M>) => M
        ) {
            console.log('useProduct', constructor.name, code)
            StoreService.registry.set(code, constructor);
            StoreService.registryInvert.set(constructor, code);
        }
    }
}