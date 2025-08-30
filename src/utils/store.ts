import { Model } from "../model";
import { TranxUtil } from "./tranx";
import { Type, Value } from "../types";

type Chunk = {
    uuid?: string,
    code: string,
    state: Record<string, Value>,
    child: Record<string, Chunk | Chunk[]>,
    refer: Record<string, string | string[]>
}

export class StoreUtil {
    private static readonly registry: Map<any, any> = new Map();
    
    public static save(model: Model): Chunk | undefined {
        const props: {
            uuid?: string,
            child: Record<string, Model | Model[]>,
            refer: Record<string, string | string[]>,
            state: Record<string, any>,
        } = {
            child: {},
            refer: {},
            state: {},
            ...model.props
        };
        const code = StoreUtil.registry.get(model.constructor);
        if (!code) return undefined;
        const result: Chunk = {
            code,
            uuid: props.uuid,
            state: props.state,
            refer: props.refer,
            child: {},
        }
        Object.keys(props.child).forEach(key => {
            if (props.child[key] instanceof Array) {
                result.child[key] = [];
                for (const item of props.child[key]) {
                    const chunk = StoreUtil.save(item);
                    if (chunk) result.child[key].push(chunk);
                }
            }
            if (props.child[key] instanceof Model) {
                const chunk = StoreUtil.save(props.child[key]);
                if (chunk) result.child[key] = chunk;
            }
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

    private static create(chunk: Chunk, refer: Record<string, Model>): Model | undefined {
        const type = StoreUtil.registry.get(chunk.code);
        if (!type) return undefined;
        const child: Record<string, Model | Model[]> = {};
        Object.keys(chunk.child).forEach(key => {
            if (chunk.child[key] instanceof Array) {
                child[key] = [];
                for (const item of chunk.child[key]) {
                    const model = StoreUtil.create(item, refer);
                    if (model) child[key].push(model);
                }
            }
            else if (chunk.child[key]) {
                const model = StoreUtil.create(chunk.child[key], refer);
                if (model) child[key] = model;
            }
        })
        const result = new type({
            uuid: chunk.uuid,
            state: chunk.state,
            child
        })
        refer[result.uuid] = result;
        return result;
    }
    
    private static bind(chunk: Chunk, refer: Record<string, Model>) {
        if (!chunk.uuid) return;

        const model = refer[chunk.uuid];
        if (!model) return;
        Object.keys(chunk.child).forEach(key => {
            const draft: Record<string, Model[] | Model> = model.utils.refer.draft;
            if (chunk.refer[key] instanceof Array) {
                draft[key] = [];
                for (const item of chunk.refer[key]) {
                    const model = refer[item];
                    if (model) draft[key].push(model);
                }
            } 
            else if (chunk.refer[key]) {
                const model = refer[chunk.refer[key]];
                if (model) draft[key] = model;
            }
        });
        Object.keys(chunk.child).forEach(key => {
            if (chunk.child[key] instanceof Array) chunk.child[key].forEach(item => StoreUtil.bind(item, refer))
            else if (chunk.child[key]) StoreUtil.bind(chunk.child[key], refer);
        })
    }

    private constructor() {}

    public static is(code: string) {
        return function (
            constructor: Type<Model>
        ) {
            if (StoreUtil.registry.has(code)) return;
            if (StoreUtil.registry.has(constructor)) return;
            StoreUtil.registry.set(code, constructor);
            StoreUtil.registry.set(constructor, code);
        }
    }
}