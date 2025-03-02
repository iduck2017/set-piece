import { DebugService } from "@/services/debug";
import { BaseModel, Model } from "../model"
import { FiberService } from "@/services/fiber";
import { Plugin } from ".";

export type ChildUpdateEvent<C> = Readonly<{ 
    target: BaseModel, 
    childPrev: Readonly<C>, 
    childNext: Readonly<C> 
}>

export class ReferPlugin<
    C extends Record<string, BaseModel> | BaseModel[],
    P extends BaseModel | null,
    R extends Record<string, BaseModel | Readonly<BaseModel[]>>
> extends Plugin {
    private static _roots: Function[] = [];
    static useRoot() {
        return function (constructor: Function) {
            ReferPlugin._roots.push(constructor);
        };
    }

    private _root?: BaseModel;
    private _parent?: P;
    private _key?: string | number;
    
    readonly childProxy: Readonly<C>;

    private readonly self: BaseModel;
    private readonly _childNext: Readonly<C>;
    private _childPrev: Readonly<C>;

    private _childModified: string[] = [];
    protected _childCurrent: Readonly<C>;
    protected _referCurrent?: Readonly<R>;

    get childCurrent() { return this.copyChild(this._childCurrent) }
    get referCurrent() { return { ...this._referCurrent } }
    get parent() { return this._parent }
    get root() { return this._root }
    get isLoad() { return this._isLoad }

    private _isLoad: boolean = false;
    private _isBind: boolean = false;

    constructor(
        child: Readonly<C>,
        self: BaseModel
    ) {
        super(self);

        for (const key of Object.keys(child)) {
            let value = Reflect.get(child, key);
            if (!(value instanceof Model)) continue;
            const refer = value.plugins.refer;
            if (refer._isLoad) value = value.copy();

            Reflect.set(child, key, value);
        }
        this.childProxy = new Proxy(child, {
            get: this.getChild.bind(this),
            set: this._setChild.bind(this),
            deleteProperty: this._deleteChild.bind(this),
        })
        
        this._childNext = this.copyChild(child);
        this._childPrev = this.copyChild(child);
        this._childCurrent = this.copyChild(child);
    }


    @DebugService.useStack()
    private _setChild(origin: C, key: string, next: BaseModel) {
        Reflect.set(this._childNext, key, next);
        return true;
    }

    @DebugService.useStack()
    private _deleteChild(origin: C, key: string) {
        Reflect.deleteProperty(this._childNext, key);
        return true;
    }

    protected getChild(origin: C, key: string) {
        origin = this._childNext;
        const keys = [ 'pop', 'push', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill' ];
        if (!(this._childCurrent instanceof Array)) origin = this._childCurrent;
        if (!keys.includes(key)) origin = this._childCurrent;
        let value = Reflect.get(origin, key);
        if (typeof value === 'function') value = value.bind(origin);
        return value;
    }
    
    private _operateChild(origin: C, key: string, value: any) {
        
    }

    listChild(child: C) { return Object.values(child); }
    
    copyChild(child: C): Readonly<C> {
        const constructor: any = child.constructor;
        const result = new constructor();
        for (const key of Object.keys(result)) {
            const value = Reflect.get(result, key);
            Reflect.set(result, key, value);
        }
        return result;
    }

    private diffChild(): Readonly<[
        Readonly<BaseModel[]>,
        Readonly<BaseModel[]>
    ]> {

    }
}


