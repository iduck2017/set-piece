import { Model } from "../model";
import { TranxService } from "./tranx";

interface Chunk {
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
        } = model.props;

        const code = StoreService.reg.get(model.constructor);
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
                value.forEach(value => {
                    const chunk = StoreService.save(value);
                    if (chunk && result.child[key] instanceof Array) {
                        result.child[key].push(chunk);
                    }
                })
            } else if (value) {
                const chunk = StoreService.save(value);
                if (chunk) result.child[key] = chunk;
            }
        }
        return result;
    }

    @TranxService.use()
    public static load(chunk: Chunk): Model | undefined {
        const reg: Record<string, Model> = {};
        const model = StoreService.create(chunk, reg);
        StoreService.bind(chunk, reg);
        return model;
    }

    
    private static create(chunk: Chunk, reg: Record<string, Model>): Model | undefined {
        const type = StoreService.reg.get(chunk.code);
        if (!type) return undefined;
        const child: Record<string, Model | Model[]> = {};
        Object.keys(chunk.child).forEach(key => {
            const value = chunk.child[key];
            if (value instanceof Array) {
                child[key] = [];
                value.forEach(value => {
                    const model = StoreService.create(value, reg);
                    if (model && child[key] instanceof Array) {
                        child[key].push(model);
                    }
                })
            } else if (value) {
                const model = StoreService.create(value, reg);
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
        for (const key of Object.keys(chunk.refer)) {
            const value = chunk.refer[key];
            const refer: Record<string, Model[] | Model> = model.agent.refer.draft;
            if (value instanceof Array) {
                const array: Model[] = [];
                for (const uuid of value) {
                    const model = reg[uuid];
                    if (model) array.push(model);
                }
                refer[key] = array;
            } else if (value) {
                const model = reg[value];
                if (model) refer[key] = model;
            }
        }
        for (const key of Object.keys(chunk.child)) {
            let value = chunk.child[key];
            if (value instanceof Array) {
                value.forEach(value => {
                    StoreService.bind(value, reg);
                })
            } else if (value) {
                StoreService.bind(value, reg);
            }
        }
    }


    private constructor() {}

    public static is<I extends string, M extends Model>(code: I) {
        return function (
            constructor: new (props: any) => M
        ) {
            console.log('useProduct', constructor.name, code)
            StoreService.reg.set(code, constructor);
            StoreService.reg.set(constructor, code);
        }
    }
}