import { Model } from "../model";
import Joi from "joi";

export class FactoryService {
    
    private static _productsByCode: Map<string, any> = new Map();
    private static _codesByProduct: Map<Function, string> = new Map();
    
    static useProduct<T extends string>(code: T) {
        return function (constructor: new (...args: any[]) => Model) {
            FactoryService._productsByCode.set(code, constructor);
            FactoryService._codesByProduct.set(constructor, code);
        };
    }

    private static _ticket = Date.now() % (36 ** 2);
    private static _timestamp = Date.now(); 
    
    static get uuid(): string {
        let now = Date.now();
        const ticket = FactoryService._ticket;
        FactoryService._ticket += 1;
        if (FactoryService._ticket > 36 ** 3 - 1) {
            FactoryService._ticket = 36 ** 2;
            while (now === FactoryService._timestamp) now = Date.now();
        }
        this._timestamp = now;
        return now.toString(36) + ticket.toString(36);
    }
  
    static serialize(model: Model) {
        const code = FactoryService._codesByProduct.get(model.constructor);
        if (!code) return undefined;
        const props = model.props;
        const child = props.child instanceof Array ? [] : {};
        if (!props.child) return undefined;
        Object.keys(props.child).forEach(key => {
            const value = props.child?.[key];
            if (!(value instanceof Model)) return undefined;
            const chunk = FactoryService.serialize(value);
            if (!chunk) return undefined;
            Reflect.set(child, key, chunk);
        });
        return {
            code,
            uuid: props.uuid,
            state: props.state,
            child,
        }
    }

    static deserialize(chunk: {
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

        const constructor = FactoryService._productsByCode.get(chunk.code);
        if (!constructor) return undefined;

        let child: any;
        if (chunk.child instanceof Array) {
            child = [];
            for (const value of chunk.child) {
                const model = FactoryService.deserialize(value);
                if (!model) return undefined;
                child.push(model);
            }
        } else {
            child = {};
            for (const key of Object.keys(chunk.child)) {
                const value = chunk.child[key];
                const model = FactoryService.deserialize(value);
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