import { BaseModel, Model } from "."

export type ChildUpdateEvent<C> = Readonly<{ 
    target: BaseModel, 
    childPrev: Readonly<C>, 
    childNext: Readonly<C> 
}>

type Constructor<T> = new (...args: any[]) => T;

export abstract class ReferPlugin<
    C extends Record<string, BaseModel> | BaseModel[],
    P extends BaseModel | undefined
> {
    private static _roots: Function[] = [];
    static useRoot() {
        return function (constructor: Function) {
            ReferPlugin._roots.push(constructor);
        };
    }
    
    protected readonly _model: BaseModel;

    root: BaseModel;
    
    parent?: P;

    childPrev: Readonly<C>;
    readonly childDelegator: C;

    readonly childDraft: C;
    _child: C;
    get child(): C { return this.copyChild(this._child) }

    constructor(
        child: Readonly<C>,
        model: BaseModel
    ) {
        this._model = model;
        this._child = this.copyChild(child);
        this.childPrev = this.copyChild(child);
        this.childDraft = this.copyChild(child);
    }

    abstract listChild(child: C): BaseModel[]
    abstract copyChild(child: C): Readonly<C>
}

export class DictChildPlugin<
    C extends Record<string, BaseModel>,
    P extends BaseModel | undefined
> extends ReferPlugin<C, P> {
    constructor(
        child: Readonly<C>,
        model: BaseModel,
    ) {
        const _child: any = {};
        for (const key of Object.keys(child)) {
            const model: BaseModel | undefined = Reflect.get(child, key);
            if (!model) continue;
            const _model = model.refer.isReserved ? model.copy() : model;
            _model.refer.parentMemory = _model;
            Reflect.set(_child, key, _model);
        }
        super(_child, model);

    }

    copyChild(child: C): Readonly<C> { return { ...child } }
    listChild(child: C): BaseModel[] { return Object.values(child) }
}

export class ListChildPlugin<
    C extends BaseModel[],
    P extends BaseModel | undefined
> extends ReferPlugin<C, P> {

    constructor(
        child: Readonly<C>,
        model: BaseModel
    ) {
        const _child: any = [];
        for (const model of child) {
            if (!model) continue;
            const _model = model.refer.isReserved ? model.copy() : model;
            _model.refer.parentMemory = _model;
            _child.push(_model);
        }
        super(_child, model);
    }

    copyChild(child: C): Readonly<C> { return [ ...child ] }
    listChild(child: C): BaseModel[] { return [ ...child ] }
}
