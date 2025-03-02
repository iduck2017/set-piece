import Joi from "joi";
import { BaseModel, Model } from "../model";

export class StoreService {
    
    private static _productRegistry: Map<string, any> = new Map();
    private static _productRefer: Map<Function, string> = new Map();
    
    static useProduct<T extends string>(code: T) {
        return function (constructor: new (...args: any[]) => BaseModel) {
            StoreService._productRegistry.set(code, constructor);
            StoreService._productRefer.set(constructor, code);
        };
    }

    private static _ticket = Date.now() % (36 ** 2);
    private static _timestamp = Date.now(); 
    
    static get uuid(): string {
        let now = Date.now();
        const ticket = StoreService._ticket;
        StoreService._ticket += 1;
        if (StoreService._ticket > 36 ** 3 - 1) {
            StoreService._ticket = 36 ** 2;
            while (now === StoreService._timestamp) now = Date.now();
        }
        this._timestamp = now;
        return now.toString(36) + ticket.toString(36);
    }
  
    static serialize(model: BaseModel) {
        const code = StoreService._productRefer.get(model.constructor);
        if (!code) return undefined;
        
        const props = model.props;
        if (!props.child) return undefined;

        const constructor: any = props.child.constructor;
        const child = new constructor();
        const keys = Object.keys(props.child);
        for (const key of keys) {
            const value = Reflect.get(props.child, key);
            if (!(value instanceof Model)) continue;
            const chunk = StoreService.serialize(value);
            if (!chunk) continue;
            Reflect.set(child, key, chunk);
        }

        return {
            code,
            uuid: props.uuid,
            child,
            state: props.state,
        }
    }

    static unserialize(chunk: {
        code: string,
        uuid: string,
        state: Record<string, any>,
        child: Record<string, any>
    }) {
        if (!chunk) return undefined;
        
        const schema = Joi.object({
            uuid: Joi.string().optional(),
            code: Joi.string().required(),
            state: Joi.object().required(),
            child: Joi.alternatives().try(
                Joi.object(),
                Joi.array()
            ).required()
        });
        const { error } = schema.validate(chunk);
        if (error) return undefined;

        const constructor = StoreService._productRegistry.get(chunk.code);
        if (!constructor) return undefined;

        let child: any;
        if (chunk.child instanceof Array) {
            child = [];
            for (const value of chunk.child) {
                const model = StoreService.unserialize(value);
                if (!model) return undefined;
                child.push(model);
            }
        } else {
            child = {};
            for (const key of Object.keys(chunk.child)) {
                const value = chunk.child[key];
                const model = StoreService.unserialize(value);
                if (!model) return undefined;
                Reflect.set(child, key, model);
            }
        }
        
        return new constructor({
            code: chunk.code,
            uuid: chunk.uuid,
            state: chunk.state,
            child,
        });
    }

    private constructor() {}
}