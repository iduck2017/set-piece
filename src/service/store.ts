import { Model } from "../model";

interface Chunk {
    uuid?: string,
    code: string,
    state: Record<string, any>,
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
            state: Record<string, any>,
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

            if (Array.isArray(value)) {
                result.child[key] = [];
                for (const model of value) {
                    if (!model) continue;
                    const chunk = StoreService.save(model);
                    if (chunk) result.child[key].push(chunk);
                }
            }
            if (Model.isModel(value)) {
                const chunk = StoreService.save(value);
                if (chunk) result.child[key] = chunk;
            }
        }
        
        return result;
    }

    private static init(chunk: Chunk, registry: Record<string, Model>): Model | undefined {
        const type = StoreService.registry.get(chunk.code);
        if (!type) return undefined;

        const child: Record<string, Model | Model[]> = {};
        for (const key of Object.keys(chunk.child)) {
            const value = chunk.child[key];
            if (Array.isArray(value)) {
                child[key] = [];
                for (const chunk of value) {
                    if (!chunk) continue;
                    const model = StoreService.init(chunk, registry);
                    if (model) child[key].push(model);
                }
            } else if (value) {
                const model = StoreService.init(value, registry);
                if (model) child[key] = model;
            }
        }
        
        const result = new type({
            uuid: chunk.uuid,
            state: chunk.state,
            child,
        })
        registry[result.uuid] = result;
        return result;
    }

    private static bind(chunk: Chunk, registry: Record<string, Model>) {
        if (!chunk.uuid) return;

        const model = registry[chunk.uuid];
        if (!model) return;

        for (const key of Object.keys(chunk.refer)) {
            const value = chunk.refer[key];
            const refer: Record<string, Model[] | Model> = model.agent.refer.draft;
            if (!value) continue;

            if (Array.isArray(value)) {
                const array: Model[] = [];
                for (const uuid of value) {
                    const model = registry[uuid];
                    if (model) array.push(model);
                }
                refer[key] = array;
            } else if (value) {
                const model = registry[value];
                if (model) refer[key] = model;
            }
        }

        for (const key of Object.keys(chunk.child)) {
            let value = chunk.child[key];

            if (!value) continue;
            if (!Array.isArray(value)) value = [value];
            for (const chunk of value) {
                StoreService.bind(chunk, registry);
            }
        }
    }

    public static load(chunk: Chunk): Model | undefined {
        const registry: Record<string, Model> = {};

        const model = StoreService.init(chunk, registry);
        StoreService.bind(chunk, registry);

        return model;
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