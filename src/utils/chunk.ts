import { Model } from "../model";
import { TranxService } from "./tranx";
import { Class } from "../types";

export type Chunk = {
    uuid?: string,
    code: string,
    state: Record<string, any>,
    child: Record<string, Chunk[] | Chunk | undefined>,
    refer: Record<string, string[] | string | undefined>
}

export class ChunkService {

    // uuid
    private static ticket: number = 36 ** 7;

    public static get uuid() {
        let time = Date.now();
        const ticket = ChunkService.ticket += 1;
        if (ChunkService.ticket >= 36 ** 8) {
            ChunkService.ticket = 36 ** 7;
            while (Date.now() === time) {}
            time = Date.now();
        };
        return `${time.toString(36)}-${ticket.toString(36)}`;
    }

    private static readonly registry: Map<any, any> = new Map();
    
    public static save(model: Model): Chunk | undefined {
        const props = { ...model.props };
        const code = ChunkService.registry.get(model.constructor);
        if (!code) return undefined;
        const result: Chunk = {
            code,
            uuid: props.uuid,
            state: props.state ?? {},
            refer: props.refer ?? {},
            child: {},
        }
        const child: Partial<Model.C> = props.child ?? {};
        Object.keys(child).forEach(key => {
            const value = child[key];
            if (value instanceof Model) {
                result.child[key] = ChunkService.save(value);
            }
            if (value instanceof Array) {
                result.child[key] = value
                    .map(item => ChunkService.save(item))
                    .filter(item => item !== undefined);
            }
        });
        return result;
    }

    @TranxService.span()
    public static load(chunk: Chunk): Model | undefined {
        const context: Record<string, Model> = {};
        const model = ChunkService.create(context, chunk);
        ChunkService.bind(chunk, context);
        return model;
    }

    private static create(
        context: Record<string, Model>, 
        chunk?: Chunk
    ): Model | undefined {
        if (!chunk) return;
        const type = ChunkService.registry.get(chunk.code);
        if (!type) return;
        const result = new type(() => {
            const origin: Record<string, Model[] | Model | undefined> = {};
            const child = chunk.child;
            Object.keys(child).forEach(key => {
                const value = child[key];
                if (!value) return;
                if (value instanceof Array) {
                    origin[key] = value
                        .map(item => ChunkService.create(context, item))
                        .filter(item => item !== undefined);
                }
                else origin[key] = ChunkService.create(context, value);
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
    
    private static bind(
        chunk: Chunk | undefined, 
        registry: Record<string, Model>
    ) {
        if (!chunk) return;
        if (!chunk.uuid) return;
        const model = registry[chunk.uuid];
        if (!model) return;
        const child = chunk.child;
        const refer = chunk.refer;
        const origin: Record<string, Model[] | Model | undefined> = {};
        Object.keys(refer).forEach(key => {
            const value = refer[key];
            if (!value) return;
            if (value instanceof Array) {
                origin[key] = value
                    .map(item => registry[item])
                    .filter(item => item !== undefined);
            }
            else origin[key] = registry[value];
        })
        model.utils.refer.init(origin);
        Object.keys(child).forEach(key => {
            const value = child[key];
            if (!value) return;
            if (value instanceof Array) {
                value.forEach(item => ChunkService.bind(item, registry))
            }
            else ChunkService.bind(value, registry);
        })
    }

    public static is<M extends Model>(code: string) {
        return function (type: Class<M, [M['props']]>) {
            if (ChunkService.registry.has(code)) return;
            if (ChunkService.registry.has(type)) return;
            ChunkService.registry.set(code, type);
            ChunkService.registry.set(type, code);
        }
    }

    @TranxService.span()
    public static copy<T extends Model>(
        model: T, 
        props?: T['props']
    ): T | undefined {
        if (!ChunkService.registry.has(model.constructor)) return;
        const type: any = model.constructor
        // props
        props = { ...model.props, ...props }
        props.child = {};
        delete props.uuid;
        // child
        const child: Record<string, Model[] | Model | undefined> = props.child;
        Object.keys(child).forEach((key) => {
            const value = child[key];
            if (!value) return;
            child[key] = 
                value instanceof Array ? value
                    .map(item => ChunkService.copy(item))
                    .filter(item => item !== undefined) : 
                ChunkService.copy(value);
        })
        // copy
        return new type(props)
    }

    private constructor() {}
}