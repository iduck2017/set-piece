import { BaseEvent } from "../types/model";
import { Provider } from "./provider";

export class Consumer<
    H extends BaseEvent
> {
    public readonly _providers: { 
        [K in keyof H]?: Provider<Pick<H, K>>[] 
    };

    protected _handlers: H;
    public get handlers() { return { ...this._handlers }; }

    constructor(
        config: {
            handlers: H
        }
    ) {
        this._providers = {};
        this._handlers = config.handlers;
    }

    public _add<K extends keyof H>(
        key: K,
        target: Provider<Pick<H, K>>
    ) {
        let providers = this._providers[key];
        if (!providers) {
            providers = this._providers[key] = [];
        }
        providers.push(target);
    }

    public _del<K extends keyof H>(
        key: K,
        target: Provider<Pick<H, K>>
    ) {
        const providers = this._providers[key];
        if (!providers) {
            throw new Error();
        }
        const providerId = providers.indexOf(target);

        if (providerId === -1) {
            throw new Error();
        }
        providers.splice(providerId, 1);
    }

    public _dispose() {
        for (const index in this._providers) {
            const key: keyof H = index;
            const providers = this._providers[key];
            if (providers) {
                for (const provider of providers) {
                    provider.unbind(key, this);
                }
            }
        }
    }
}

