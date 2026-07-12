import { decorConsumerResolver } from "../decor/decor-consumer-resolver";
import { decorProducerResolver } from "../decor/decor-producer-resolver";
import { eventConsumerResolver } from "../event/event-consumer-resolver";
import { frameConsumerResolver } from "../frame/frame-consumer-resolver";
import { memoResolver } from "../memo/memo-resolver";
import { Model } from "../model";
import { modelResolver } from "./model-resolver";
import { routeResolver } from "../route/route-resolver";
import { Constructor } from "../types";
import { useAction } from "../hooks/use-action";
import { useBlink } from "../hooks/use-blink";

export class BlinkManager {
    private _pending = false;

    /**
     * Execute one blink and refresh dependency-driven bindings afterward.
     *
     * Nested blinks reuse the outer blink so model initialization and binding
     * refreshes happen once after the outermost operation finishes.
     *
     * @param handler - Operation that may change dependency graphs.
     * @returns The handler result.
     */
    @useAction()
    public launch(handler: () => unknown) {
        if (this._pending) return handler();
        this._pending = true;
        const output = handler();
        this._pending = false;
        const dirty = this.precheck();
        if (!dirty) return output;
        this.resolve()
        return output;
    }

    /**
     * Check whether any blink-scoped resolver has pending work.
     *
     * @returns True when model, memo, decor, event, or frame binding work is
     * queued.
     */
    protected precheck() {
        const dirty =
            memoResolver.check() ||
            decorConsumerResolver.check() ||
            decorProducerResolver.check() ||
            eventConsumerResolver.check() ||
            frameConsumerResolver.check() ||
            routeResolver.check() ||
            modelResolver.check()
        return dirty;
    }

    /**
     * Wrap construction so initial model binding runs inside one blink.
     *
     * This is used by `useModel()` and `useView()` so a constructor can create
     * nested models while all initialization waits for the same blink boundary.
     *
     * @param ModelCtor - Model constructor to wrap.
     * @returns A constructor with blink-aware initialization semantics.
     */
    public delegate<T extends Model>(ModelCtor: Constructor<Model>): Constructor<T> {
        const that = this;
        return {
            [ModelCtor.name]: class extends ModelCtor {
                /**
                 * Construct the model while preserving the outer blink boundary.
                 *
                 * @param params - Constructor parameters forwarded to the model.
                 */
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
        }[ModelCtor.name] as any
    }

    /**
     * Resolve all blink-scoped queues in dependency order.
     *
     * Model initialization and memo/decor producers run before consumer
     * bindings so consumers see initialized and freshly computed values.
     *
     * @returns Nothing.
     */
    @useBlink()
    private resolve() {
        modelResolver.resolve();
        routeResolver.resolve();
        memoResolver.resolve();
        decorProducerResolver.resolve();
        
        decorConsumerResolver.resolve();
        eventConsumerResolver.resolve();
        frameConsumerResolver.resolve();
    }
}

export const blinkManager = new BlinkManager();
