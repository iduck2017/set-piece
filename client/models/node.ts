import { BaseEvent } from "../types/base";

class Provider<
    E extends BaseEvent,
> {
    public readonly container: any;
    public readonly consumers: { [K in keyof E]?: Consumer<Pick<E, K>>[] };

    constructor(container: any) {
        this.container = container;
        this.consumers = {};
    }
        
    public emit<K extends keyof E>(key: K): E[K] {
        return ((...data: Parameters<E[K]>) => {
            const consumers = this.consumers[key];
            if (consumers) {
                for (const consumer of consumers) {
                    if (consumer.handlers) {
                        consumer.handlers[key](...data);
                    }
                }
            }
        }) as any;
    }

    public bind<K extends keyof E>(
        key: K,
        that: Consumer<Pick<E, K>>
    ) {
        let providers = that.providers[key];
        let consumers = this.consumers[key];
        if (!providers) {
            providers = that.providers[key] = [];
        }
        if (!consumers) {
            consumers = this.consumers[key] = [];
        }
        providers.push(this);
        consumers.push(that);
    }

    public unbind<K extends keyof E>(
        key: K,
        that: Consumer<Pick<E, K>>
    ) {
        const providers = that.providers[key];
        const consumers = this.consumers[key];
        if (!providers || !consumers) {
            throw new Error();
        }
        const providerId = providers.indexOf(this);
        const consumerId = consumers.indexOf(that);

        if (providerId === -1 || consumerId === -1) {
            throw new Error();
        }
        providers.splice(providers.indexOf(this), 1);
        consumers.splice(consumers.indexOf(that), 1);
    }
}

class Consumer<
    H extends BaseEvent,
> {
    public readonly container: any;
    public readonly providers: { [K in keyof H]?: Provider<Pick<H, K>>[] };

    public handlers: H;

    constructor(
        handlers: H,
        container: any
    ) {
        this.providers = {};
        this.container = container;
        this.handlers = handlers;
    }

    public dispose() {
        for (const index in this.providers) {
            const key: keyof H = index;
            const providers = this.providers[key];
            if (providers) {
                for (const provider of providers) {
                    provider.unbind(key, this);
                }
            }
        }
    }
}


export {
    Provider,
    Consumer 
};