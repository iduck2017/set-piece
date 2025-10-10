import { Model } from "../model";
import { TranxUtil } from "./tranx";
import { Class } from "../types";

export type Chunk = {
    uuid?: string,
    code: string,
    state: Record<string, any>,
    child: Record<string, Chunk[] | Chunk | undefined>,
    refer: Record<string, string[] | string>
}

export class TemplUtil {

    // uuid
    private static ticket: number = 36 ** 7;
    public static get uuid() {
        let time = Date.now();
        const ticket = TemplUtil.ticket += 1;
        if (TemplUtil.ticket >= 36 ** 8) {
            TemplUtil.ticket = 36 ** 7;
            while (Date.now() === time) {}
            time = Date.now();
        };
        return `${time.toString(36)}-${ticket.toString(36)}`;
    }

    private static readonly registry: Map<any, any> = new Map();
    
    // public static save(model: Model): Chunk | undefined {
    //     const props = { ...model.props };
    //     const code = StoreUtil.registry.get(model.constructor);
    //     if (!code) return undefined;
    //     const result: Chunk = {
    //         code,
    //         uuid: props.uuid,
    //         state: props.state ?? {},
    //         refer: props.refer ?? {},
    //         child: {},
    //     }
    //     const child: Props.C = props.child ?? {};
    //     Object.keys(child).forEach(key => {
    //         const value = child[key];
    //         if (value instanceof Model) result.child[key] = StoreUtil.save(value);
    //         if (value instanceof Array) 
    //             result.child[key] = value
    //                 .map(item => StoreUtil.save(item))
    //                 .filter(item => item !== undefined);
    //     });
    //     return result;
    // }

    // @TranxUtil.span()
    // public static load(chunk: Chunk): Model | undefined {
    //     const context: Record<string, Model> = {};
    //     const model = StoreUtil.create(context, chunk);
    //     StoreUtil.bind(chunk, context);
    //     return model;
    // }

    // private static create(context: Record<string, Model>, chunk?: Chunk): Model | undefined {
    //     if (!chunk) return;
    //     const type = StoreUtil.registry.get(chunk.code);
    //     if (!type) return;
    //     const result = new type(() => {
    //         const origin: Record<string, Model[] | Model | undefined> = {};
    //         const child = chunk.child;
    //         Object.keys(child).forEach(key => {
    //             const value = child[key];
    //             if (!value) return;
    //             origin[key] = value instanceof Array ? 
    //                 value.map(item => StoreUtil.create(context, item)).filter(item => item !== undefined) : 
    //                 StoreUtil.create(context, value);
    //         })
    //         return {
    //             uuid: chunk.uuid,
    //             state: chunk.state,
    //             child: origin
    //         }
    //     })
    //     context[result.uuid] = result;
    //     return result;
    // }
    
    // private static bind(chunk: Chunk | undefined, registry: Record<string, Model>) {
    //     if (!chunk) return;
    //     if (!chunk.uuid) return;
    //     const model = registry[chunk.uuid];
    //     if (!model) return;
    //     const child = chunk.child;
    //     const refer = chunk.refer;
    //     const origin: Record<string, Model[] | Model | undefined> = {};
    //     Object.keys(refer).forEach(key => {
    //         const value = refer[key];
    //         if (!value) return;
    //         origin[key] = value instanceof Array ? 
    //             value.map(item => registry[item]).filter(item => item !== undefined) : 
    //             registry[value];
    //     })
    //     model.utils.refer.init(origin);
    //     Object.keys(child).forEach(key => {
    //         const value = child[key];
    //         if (!value) return;
    //         if (value instanceof Array) value.forEach(item => StoreUtil.bind(item, registry))
    //         else StoreUtil.bind(value, registry);
    //     })
    // }

    public static is<M extends Model>(code: string) {
        return function (type: Class<M, [M['props']]>) {
            if (TemplUtil.registry.has(code)) return;
            if (TemplUtil.registry.has(type)) return;
            TemplUtil.registry.set(code, type);
            TemplUtil.registry.set(type, code);
        }
    }

    @TranxUtil.span()
    public static copy<T extends Model>(model: T, props?: T['props']): T | undefined {
        if (!TemplUtil.registry.has(model.constructor)) return;
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
                    .map(item => TemplUtil.copy(item))
                    .filter(item => item !== undefined) : 
                TemplUtil.copy(value);
        })
        // copy
        return new type(props)
    }

    private constructor() {}
}