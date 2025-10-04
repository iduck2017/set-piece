import { Model } from "../model";
import { TranxUtil } from "./tranx";
import { Method, Value } from "../types";
import { Loader, Props } from "../types/model";
import { Type } from "..";

export type Chunk = {
    uuid?: string,
    code: string,
    state: Record<string, Value>,
    child: Record<string, Partial<Chunk[]> | Chunk | undefined>,
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
        const child: Props.C = props.child ?? {};
        Object.keys(child).forEach(key => {
            const value = child[key];
            if (value instanceof Array) result.child[key] = value.map(item => StoreUtil.save(item)).filter(Boolean);
            if (value instanceof Model) result.child[key] = StoreUtil.save(value);
        });
        return result;
    }

    @TranxUtil.span()
    public static load(chunk: Chunk): Model | undefined {
        const context: Record<string, Model> = {};
        const model = StoreUtil.create(context, chunk);
        StoreUtil.bind(chunk, context);
        return model;
    }

    private static create(context: Record<string, Model>, chunk: Chunk | undefined): Model | undefined {
        if (!chunk) return;
        const type = StoreUtil.registry.get(chunk.code);
        if (!type) return;
        const result = new type(() => {
            const origin: Record<string, Partial<Model[]> | Model | undefined> = {};
            const child = chunk.child;
            Object.keys(child).forEach(key => {
                const value = child[key];
                if (value instanceof Array) {
                    origin[key] = value.map(item => StoreUtil.create(context, item)).filter(Boolean);
                } else if (value) origin[key] = StoreUtil.create(context, value);
            })
            return {
                uuid: chunk.uuid,
                state: chunk.state,
                child: origin
            }
        })
        context[result.uuid] = result;
        return result;
    }
    
    private static bind(chunk: Chunk | undefined, registry: Record<string, Model>) {
        if (!chunk) return;
        if (!chunk.uuid) return;
        const model = registry[chunk.uuid];
        if (!model) return;
        const child = chunk.child;
        const refer = chunk.refer;
        const origin: Record<string, Partial<Model[]> | Model | undefined> = {};
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

    public static is<M extends Model>(code: string) {
        // todu
        return function (type: Type<M, [Loader<M>]>) {
            if (StoreUtil.registry.has(code)) return;
            if (StoreUtil.registry.has(type)) return;
            StoreUtil.registry.set(code, type);
            StoreUtil.registry.set(type, code);
        }
    }

    public static copy<T extends Model>(model: T): T | undefined {
        if (!StoreUtil.registry.has(model.constructor)) return;
        const type: any = model.constructor
        return new type(() => ({
            ...model.props,
            uuid: undefined,
        }))
    }

    private constructor() {}
}