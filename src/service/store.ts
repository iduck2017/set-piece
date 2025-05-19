import { Model } from "@/model";
import { Value } from "@/types";

interface Chunk {
    uuid?: string,
    code: string,
    state: Record<string, Value>,
    child: Record<string, Chunk | Chunk[]>,
    refer: Record<string, string | string[]>
}

export class StoreService {
    private static readonly registry: Map<any, any> = new Map();
    
    public static save(model: Model): Chunk | undefined {
        const props: {
            uuid?: string,
            child: Record<string, Model | Model[]>,
            refer: Record<string, string | string[]>,
            state: Record<string, Value>,
        } = {
            state: {},
            child: {},
            refer: {},
            ...model.props,
        };

        const code = StoreService.registry.get(model.constructor);
        if (!code) return undefined;

        const result: Chunk = {
            code,
            uuid: props.uuid,
            state: props.state,
            refer: props.refer,
            child: {},
        }

        for (const key of Object.keys(props.child)) {
            const value = props.child[key];

            if (value instanceof Array) {
                result.child[key] = [];
                for (const model of value) {
                    if (!model) continue;
                    const chunk = StoreService.save(model);
                    if (chunk) result.child[key].push(chunk);
                }
            }

            if (value instanceof Model) {
                const chunk = StoreService.save(value);
                if (chunk) result.child[key] = chunk;
            }
        }
        
        return result;
    }

    public static load(chunk: Chunk): Model | undefined {

        const type = StoreService.registry.get(chunk.code);
        if (!type) return undefined;

        const child: Record<string, Model | Model[]> = {};

        for (const key of Object.keys(chunk.child)) {
            const value = chunk.child[key];

            if (value instanceof Array) {
                child[key] = [];
                for (const chunk of value) {
                    if (!chunk) continue;
                    const model = StoreService.load(chunk);
                    if (model) child[key].push(model);
                }
            }
            
            else if (value) {
                const model = StoreService.load(value);
                if (model) child[key] = model;
            }
        }
        
        const result = new type({
            uuid: chunk.uuid,
            state: chunk.state,
            refer: chunk.refer,
            child,
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
            StoreService.registry.set(constructor, code);
        }
    }
}