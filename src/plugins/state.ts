import { Value } from "@/types"
import { BaseModel } from "."

export type StateUpdateEvent<S extends Record<string, Value>> = Readonly<{ 
    target: BaseModel, 
    statePrev: Readonly<S>, 
    stateNext: Readonly<S> 
}>

type DecorReceiver<S = any> = { key: string, target: BaseModel }
type DecorHandler<S = any> = (statePrev: S) => S
type DecorProvider<S = any> = { handler: DecorHandler<S>, target: BaseModel }

export type DecorProviders<S = any> = Readonly<{ [K in keyof S]: DecorProvider<S[K]> }>

export class StatePlugin<
    S extends Record<string, Value>
> {
    readonly uuid: string;

    private readonly _model: BaseModel;
    
    readonly proxy: S;
    
    private _prev: Readonly<S>;
    private _draft: S;
    private _origin: Readonly<S>;
    private _current: Readonly<S>;

    get current(): Readonly<S> { return { ...this._current } }

    constructor(
        uuid: string,
        state: Readonly<S>,
        model: BaseModel,
    ) {
        this.uuid = uuid;
        this._model = model;

        this._current = { ...state }
        this._draft = { ...state }
        this._prev = { ...state }
        this._origin = { ...state }

        this.proxy = new Proxy(this._draft, {
            deleteProperty: this._deleteState.bind(this),
            set: this._setState.bind(this),
            get: (origin, key: string) => {
                const result = Reflect.get(this._origin, key);
                return result;
            }
        })
    }

    private _setState(origin: S, key: string, value: Value) {
        Reflect.set(origin, key, value);
        return true;
    }

    private _deleteState(origin: S, key: string) {
        Reflect.deleteProperty(origin, key);
        return true;
    }

    

}
