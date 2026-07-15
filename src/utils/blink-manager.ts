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

/**
 * Coordinates blink boundaries and flushes dependency graph updates.
 */
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
        /** Nested blink work is folded into the outer boundary. */
        if (this._pending) return handler();
        /** Run the caller first, then inspect whether anything was queued. */
        this._pending = true;
        const output = handler();
        this._pending = false;
        /** Flush only when a resolver has pending blink-scoped work. */
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
                    /** Reuse an active blink when nested model construction occurs. */
                    if (that._pending) super(...params);
                    if (that._pending) return;
                    /** Otherwise create a construction blink and flush after super. */
                    that._pending = true;
                    super(...params);
                    that._pending = false;
                    /** Construction may queue model initialization and bindings. */
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
        /** Associate value changes before listeners refresh their bindings. */
        modelResolver.resolve();
        routeResolver.resolve();
        memoResolver.resolve();
        decorProducerResolver.resolve();
        /** Refresh listeners after values and derived values have settled. */
        decorConsumerResolver.resolve();
        eventConsumerResolver.resolve();
        frameConsumerResolver.resolve();
    }
}

export const blinkManager = new BlinkManager();
