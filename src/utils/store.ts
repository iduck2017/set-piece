import { Model } from "../model";
import { TranxUtil } from "./tranx";
import { Value } from "../types";
import { Loader } from "../types/model";

export type Chunk = {
    uuid?: string,
    code: string,
    state: Record<string, Value>,
    child: Record<string, Chunk | Array<Chunk | undefined> | undefined>,
    refer: Record<string, string | Array<string>>
}

export class StoreUtil {
    private static readonly registry: Map<any, any> = new Map();
    
    public static save(model: Model): Chunk | undefined {
        const props = { ...model.props };
        const code = StoreUtil.registry.get(model.constructor);
        if (!code) return undefined;
        const result: Chunk = {
            code,
            uuid: props.uuid,
            state: props.state ?? {},
            refer: props.refer ?? {},
            child: {},
        }
        const child: Record<string, Model | Model[]> = props.child ?? {};
        Object.keys(child).forEach(key => {
            const value = child[key];
            if (value instanceof Array) result.child[key] = value.map(item => StoreUtil.save(item)).filter(Boolean);
            if (value instanceof Model) result.child[key] = StoreUtil.save(value);
        });
        return result;
    }

    @TranxUtil.span()
    public static load(chunk: Chunk): Model | undefined {
        const refer: Record<string, Model> = {};
        const model = StoreUtil.create(chunk, refer);
        StoreUtil.bind(chunk, refer);
        return model;
    }

    private static create(chunk: Chunk | undefined, registry: Record<string, Model>): Model | undefined {
        if (!chunk) return;
        const type = StoreUtil.registry.get(chunk.code);
        if (!type) return;
        const result = new type(() => {
            const origin: Record<string, Model | Array<Model | undefined> | undefined> = {};
            const child = chunk.child;
            Object.keys(child).forEach(key => {
                const value = child[key];
                if (value instanceof Array) {
                    origin[key] = value.map(item => StoreUtil.create(item, registry)).filter(Boolean);
                } else if (value) origin[key] = StoreUtil.create(value, registry);
            })
            return {
                uuid: chunk.uuid,
                state: chunk.state,
                child: origin
            }
        })
        registry[result.uuid] = result;
        return result;
    }
    
    private static bind(chunk: Chunk | undefined, registry: Record<string, Model>) {
        if (!chunk) return;
        if (!chunk.uuid) return;
        const model = registry[chunk.uuid];
        if (!model) return;
        const child = chunk.child;
        const refer = chunk.refer;
        const origin: Record<string, Model | Array<Model | undefined> | undefined> = {};
        Object.keys(refer).forEach(key => {
            const value = refer[key];
            if (value instanceof Array) origin[key] = value.map(item => registry[item]).filter(Boolean);
            else if (value) origin[key] = registry[value];
        })
        model.utils.refer.init(origin);
        Object.keys(child).forEach(key => {
            const value = child[key];
            if (value instanceof Array) value.forEach(item => StoreUtil.bind(item, registry))
            else if (value) StoreUtil.bind(value, registry);
        })
    }

    private constructor() {}

    public static is<M extends Model>(code: string) {
        return function (type: new (props: Loader<M>) => M) {
            if (StoreUtil.registry.has(code)) return;
            if (StoreUtil.registry.has(type)) return;
            StoreUtil.registry.set(code, type);
            StoreUtil.registry.set(type, code);
        }
    }
}