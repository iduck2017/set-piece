import { Model } from "../model";
import { TranxService } from "./tranx";

type Chunk = {
    uuid?: string,
    code: string,
    state: Record<string, any>,
    child: Record<string, Chunk | Chunk[]>,
    refer: Record<string, string | string[]>
}

export class StoreService {
    private static readonly reg: Map<any, any> = new Map();
    
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
        const code = StoreService.reg.get(model.constructor);
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
                props.child[key].forEach(item => {
                    const chunk = StoreService.save(item);
                    if (chunk && result.child[key] instanceof Array) {
                        result.child[key].push(chunk);
                    }
                })
            }
            if (props.child[key] instanceof Model) {
                const chunk = StoreService.save(props.child[key]);
                if (chunk) result.child[key] = chunk;
            }
        });
        return result;
    }

    @TranxService.use()
    public static load(chunk: Chunk): Model | undefined {
        const reg: Record<string, Model> = {};
        const model = StoreService.gen(chunk, reg);
        StoreService.bind(chunk, reg);
        return model;
    }

    
    private static gen(chunk: Chunk, reg: Record<string, Model>): Model | undefined {
        const type = StoreService.reg.get(chunk.code);
        if (!type) return undefined;
        const child: Record<string, Model | Model[]> = {};
        Object.keys(chunk.child).forEach(key => {
            if (chunk.child[key] instanceof Array) {
                child[key] = [];
                chunk.child[key].forEach(item => {
                    const model = StoreService.gen(item, reg);
                    if (model && child[key] instanceof Array) child[key].push(model);
                })
            } else if (chunk.child[key]) {
                const model = StoreService.gen(chunk.child[key], reg);
                if (model) child[key] = model;
            }
        })
        const result = new type({
            uuid: chunk.uuid,
            state: chunk.state,
            child
        })
        reg[result.uuid] = result;
        return result;
    }
    
    private static bind(chunk: Chunk, reg: Record<string, Model>) {
        if (!chunk.uuid) return;

        const model = reg[chunk.uuid];
        if (!model) return;
        Object.keys(chunk.child).forEach(key => {
            const refer: Record<string, Model[] | Model> = model.agent.refer.draft;
            if (chunk.refer[key] instanceof Array) {
                refer[key] = [];
                chunk.refer[key].forEach(item => {
                    const model = reg[item];
                    if (model && refer[key] instanceof Array) refer[key].push(model);
                })
            } else if (chunk.refer[key]) {
                const model = reg[chunk.refer[key]];
                if (model) refer[key] = model;
            }
        });
        Object.keys(chunk.state).forEach(key => {
            if (chunk.child[key] instanceof Array) {
                chunk.child[key].forEach(item => StoreService.bind(item, reg))
            } else if (chunk.child[key]) StoreService.bind(chunk.child[key], reg);
        })
    }


    private constructor() {}

    public static is(code: string) {
        return function (
            constructor: new (...props: any[]) => Model
        ) {
            StoreService.reg.set(code, constructor);
            StoreService.reg.set(constructor, code);
        }
    }
}