import { Value } from "@/types"
import { BaseModel } from "../model"
import { StoreService } from "backup/plugins/store"
import { Plugin } from "."

export type DecorHandler<S = any> = (statePrev: S) => S
export type DecorReceiver<S = any> = { key: string, target: BaseModel }
export type DecorProvider<S = any> = { handler: DecorHandler<S>, target: BaseModel }
export type DecorReceivers<S = any> = Readonly<{ [K in keyof S]: DecorReceiver<S[K]> }>

export type StateUpdateEvent<S extends Record<string, Value>> = Readonly<{ 
    target: BaseModel, 
    statePrev: Readonly<S>, 
    stateNext: Readonly<S> 
}>

export class StatePlugin<
    S extends Record<string, Value>
> extends Plugin {
    readonly uuid: string;
    
    readonly _stateProxy: S;
    
    private readonly _model: BaseModel;
    private readonly _stateDraft: S;
    private _stateOrigin: Readonly<S>;
    private _stateCurrent: Readonly<S>;

    get stateCurrent(): Readonly<S> { return { ...this._stateCurrent } }
    get stateOrigin(): Readonly<S> { return { ...this._stateOrigin } }

    
    readonly decorReceivers: DecorReceivers<S>
    
    private readonly _decorProviders = new Map<DecorHandler, DecorProvider>()
    private readonly _decorRouters = new Map<DecorReceiver, DecorProvider[]>()
    private readonly _decorRefer = new Map<DecorProvider, DecorReceiver[]>()
    private readonly _decorProxy = new Map<string, DecorProvider[]>()

    constructor(
        uuid: string | undefined,
        state: Readonly<S>,
        self: BaseModel,
    ) {
        super(self);
        this.uuid = uuid ?? StoreService.uuid;

        this._stateCurrent = { ...state }
        this._stateDraft = { ...state }
        this._stateOrigin = { ...state }

        this._stateProxy = new Proxy(this._stateDraft, {
            set: this._setState.bind(this),
            get: this._getState.bind(this),
            deleteProperty: this._deleteState.bind(this),
        })

        this.decorReceivers = new Proxy({} as DecorReceivers<S>, {
            deleteProperty: () => false,
            set: () => false,
            get: (target, key: string) => {
                const value = Reflect.get(target, key);
                if (value) return value;
                const decor = { key, target: this._model };
                Reflect.set(target, key, decor);
                return decor;
            }
        })
    }

    private _getState(origin: S, key: string) {
        return Reflect.get(this._stateOrigin, key);
    }

    private _setState(origin: S, key: string, value: Value) {
        Reflect.set(origin, key, value);
        return true;
    }

    private _deleteState(origin: S, key: string) {
        Reflect.deleteProperty(origin, key);
        return true;
    }

    private _emitDecor<E>(receiver: DecorReceiver<E>, event: E) {
        const _providers = this._decorRouters.get(receiver) || [];
        const providers = [ ..._providers ];
       
        providers.sort((providerA, providerB) => {
            const stateA = providerA.target.plugins.state;
            const stateB = providerB.target.plugins.state;
            if (stateA.uuid > stateB.uuid) return 1;
            if (stateA.uuid < stateB.uuid) return -1;
            return 0;
        });
        providers.forEach(provider => {
            const { target, handler } = provider;
            handler.call(target, event); 
        })
    }

    bindDecor<E>(
        receiver: DecorReceiver<E>, 
        handler: DecorHandler<E>,
    ) {
        const target = receiver.target;

        const childA = target.plugins.refer;
        const childB = this._model.plugins.refer;

        if (childA.root !== childB.root) return;

        const that = target.plugins.state;
        const _provider: DecorProvider = { target: this._model, handler };
        const provider: DecorProvider = this._decorProviders.get(handler) ?? _provider;
   
        const providers = this._decorRouters.get(receiver) || [];
        providers.push(provider);
        that._decorRouters.set(receiver, providers);

        const receivers = this._decorRefer.get(provider) || [];
        receivers.push(receiver);
        this._decorRefer.set(provider, receivers);
    }

    unbindDecor<E>(
        receiver: DecorReceiver<E> | undefined,
        handler: DecorHandler<E>,
    ) {
        const provider = this._decorProviders.get(handler);
        if (!provider) return;

        const receivers = this._decorRefer.get(provider) || [];
        for (const _receiver of [ ...receivers ]) {
            if (receiver && _receiver !== receiver) continue;

            const that = _receiver.target.plugins.state;

            const providers = that._decorRouters.get(_receiver) || [];
            while (providers.includes(provider)) {
                const index = providers.indexOf(provider);
                if (index === -1) continue;
                providers.splice(index, 1);
            }
            that._decorRouters.set(_receiver, providers);

            const index = receivers.indexOf(_receiver);
            if (index === -1) continue;
            receivers.splice(index, 1);
        }
        this._decorRefer.set(provider, receivers);
    }

}
