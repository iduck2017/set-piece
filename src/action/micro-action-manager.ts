import { decorConsumerResolver } from "../decor/decor-consumer-resolver";
import { decorProducerResolver } from "../decor/decor-producer-resolver";
import { effectResolver } from "../effect/effect-resolver";
import { memoResolver } from "../memo/memo-resolver";
import { Model } from "../model";
import { Constructor, Method } from "../types";
import { useAction } from "./action-manager";

class MicroActionManager {
    private _pending = false;

    @useAction()
    public launch(handler: () => unknown) {
        if (this._pending) return handler();
        this._pending = true;
        const result = handler();
        this._pending = false;

        const dirty =
            memoResolver.check() ||
            effectResolver.check() ||
            decorConsumerResolver.check() ||
            decorProducerResolver.check()
        if (!dirty) return result;

        this.resolve()
        return result;
    }

    public delegate<T extends Model>(Constructor: Constructor<Model>): Constructor<T> {
        const that = this;
        const ReactiveConstructor = {
            [Constructor.name]: class extends Constructor {
                constructor(...params: any[]) {
                    if (that._pending) {
                        super(...params);
                        return;
                    }
                    that._pending = true;
                    super(...params);
                    that._pending = false;
                    const dirty =
                        memoResolver.check() ||
                        effectResolver.check() ||
                        decorConsumerResolver.check() ||
                        decorProducerResolver.check()
                    if (!dirty) return;
                    that.resolve();
                }
            }
        }[Constructor.name];
        return ReactiveConstructor as Constructor<T>;
    }

    @useMicroAction()
    private resolve() {
        memoResolver.resolve();
        effectResolver.resolve();
        decorConsumerResolver.resolve();
        decorProducerResolver.resolve();
    }
}

export const microActionManager = new MicroActionManager();

export function useMicroAction() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: any[]) {
            const _handler = handler.bind(this, ...args)
            const result = microActionManager.launch(_handler);
            return result;
        }
        return descriptor;
    }
}
