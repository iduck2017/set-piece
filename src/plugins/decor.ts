import { Value } from "@/types"
import { BaseModel } from "."

export type DecorReceiver<S = any> = { key: string, target: BaseModel }
export type DecorHandler<S = any> = (statePrev: S) => S
export type DecorProvider<S = any> = { handler: DecorHandler<S>, target: BaseModel }

export type DecorReceivers<S = any> = Readonly<{ [K in keyof S]: DecorReceiver<S[K]> }>

export class DecorPlugin<
    S extends Record<string, Value>
> {
    readonly receivers: DecorReceivers<S>

    private readonly _model: BaseModel;
    private readonly _providers = new Map<DecorHandler, DecorProvider>()
    private readonly _routers = new Map<DecorReceiver, DecorProvider[]>()
    private readonly _sources = new Map<DecorProvider, DecorReceiver[]>()

    constructor(model: BaseModel) {
        this._model = model;
        
        this.receivers = new Proxy({} as DecorReceivers<S>, {
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

    private _emitDecor<E>(receiver: DecorReceiver<E>, event: E) {
        const _providers = this._routers.get(receiver) || [];
        const providers = [ ..._providers ];
       
        providers.sort((providerA, providerB) => {
            const stateA = providerA.target.state;
            const stateB = providerB.target.state;
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

        const childA = target.refer;
        const childB = this._model.refer;

        if (childA.root !== childB.root) return;

        const that = target.decor;
        const _provider: DecorProvider = { target: this._model, handler };
        const provider: DecorProvider = this._providers.get(handler) ?? _provider;
   
        const providers = this._routers.get(receiver) || [];
        providers.push(provider);
        that._routers.set(receiver, providers);

        const receivers = this._sources.get(provider) || [];
        receivers.push(receiver);
        this._sources.set(provider, receivers);
    }

    unbindDecor<E>(
        receiver: DecorReceiver<E> | undefined,
        handler: DecorHandler<E>,
    ) {
        const provider = this._providers.get(handler);
        if (!provider) return;

        const receivers = this._sources.get(provider) || [];
        for (const _receiver of [ ...receivers ]) {
            if (receiver && _receiver !== receiver) continue;

            const that = _receiver.target.decor;

            const providers = that._routers.get(_receiver) || [];
            while (providers.includes(provider)) {
                const index = providers.indexOf(provider);
                if (index === -1) continue;
                providers.splice(index, 1);
            }
            that._routers.set(_receiver, providers);

            const index = receivers.indexOf(_receiver);
            if (index === -1) continue;
            receivers.splice(index, 1);
        }
        this._sources.set(provider, receivers);
    }

}