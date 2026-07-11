import { decorConsumerResolver } from "../decor/decor-consumer-resolver";
import { decorProducerResolver } from "../decor/decor-producer-resolver";
import { eventConsumerResolver } from "../event/event-consumer-resolver";
import { frameConsumerResolver } from "../frame/frame-consumer-resolver";
import { memoResolver } from "../memo/memo-resolver";
import { Model } from "../model";
import { modelResolver } from "../model-resolver";
import { Constructor, Method } from "../types";
import { useAction } from "./action-manager";

export class BlinkManager {
    private _pending = false;

    @useAction()
    public launch(handler: () => unknown) {
        if (this._pending) return handler();
        this._pending = true;
        const result = handler();
        this._pending = false;
        const dirty = this.precheck();
        if (!dirty) return result;
        this.resolve()
        return result;
    }

    protected precheck() {
        const dirty =
            memoResolver.check() ||
            decorConsumerResolver.check() ||
            decorProducerResolver.check() ||
            eventConsumerResolver.check() ||
            frameConsumerResolver.check() ||
            modelResolver.check()
        return dirty;
    }

    public delegate<T extends Model>(Constructor: Constructor<Model>): Constructor<T> {
        const that = this;
        return {
            [Constructor.name]: class extends Constructor {
                constructor(...params: any[]) {
                    if (that._pending) super(...params);
                    if (that._pending) return;
                    that._pending = true;
                    super(...params);
                    that._pending = false;
                    const dirty = that.precheck()
                    if (!dirty) return;
                    that.resolve();
                }
            }
        }[Constructor.name] as any
    }

    @useBlink()
    private resolve() {
        modelResolver.resolve();
        memoResolver.resolve();
        eventConsumerResolver.resolve();
        frameConsumerResolver.resolve();
        decorConsumerResolver.resolve();
        decorProducerResolver.resolve();
    }
}

export const blinkManager = new BlinkManager();

export function useBlink() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: any[]) {
            const _handler = handler.bind(this, ...args)
            const result = blinkManager.launch(_handler);
            return result;
        }
        return descriptor;
    }
}
