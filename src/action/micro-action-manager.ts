import { decorConsumerResolver } from "../decor/decor-consumer-resolver";
import { decorProducerResolver } from "../decor/decor-producer-resolver";
import { effectResolver } from "../effect/effect-resolver";
import { memoResolver } from "../memo/memo-resolver";
import { Model } from "../model";
import { Constructor, Method } from "../types";
import { useAction } from "./action-manager";

class MicroActionManager {
    private _isPending = false;

    @useAction()
    public launch(handler: () => unknown) {
        if (this._isPending) return handler();
        this._isPending = true;
        const result = handler();
        this._isPending = false;

        const isDirty =
            memoResolver.check() ||
            effectResolver.check() ||
            decorConsumerResolver.check() ||
            decorProducerResolver.check()
        if (!isDirty) return result;

        this.resolve()
        return result;
    }

    public delegate<T extends Model>(Constructor: Constructor<Model>): Constructor<T> {
        const that = this;
        const ReactiveConstructor = {
            [Constructor.name]: class extends Constructor {
                constructor(...params: any[]) {
                    if (that._isPending) {
                        super(...params);
                        return;
                    }
                    that._isPending = true;
                    super(...params);
                    that._isPending = false;
                    const isDirty =
                        memoResolver.check() ||
                        effectResolver.check() ||
                        decorConsumerResolver.check() ||
                        decorProducerResolver.check()
                    if (!isDirty) return;
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
