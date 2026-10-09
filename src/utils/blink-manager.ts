import { decorConsumerResolver } from "../decor/decor-consumer-resolver";
import { eventConsumerResolver } from "../event/event-consumer-resolver";
import { frameConsumerResolver } from "../frame/frame-consumer-resolver";
import { memoResolver } from "../memo/memo-resolver";
import { Model } from "../model";
import { modelResolver } from "./model-resolver";
import { routeResolver } from "../route/route-resolver";
import { refResolver } from "../ref/ref-resolver";
import { Constructor } from "../types";
import { useAction } from "../hooks/use-action";

/**
 * Coordinates blink boundaries and flushes dependency graph updates.
 */
export class BlinkManager {
    private _pending = false;

    /**
     * Execute one blink and refresh dependency-driven bindings afterward.
     *
     * Nested blinks reuse the outer blink. After the outermost operation,
     * resolve queued work in rounds until no blink-scoped tasks remain.
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
        /** Keep nested registrations queued while draining successive rounds. */
        while (this.precheck()) this.resolve();
        this._pending = false;
        return output;
    }

    /**
     * Check whether any blink-scoped resolver has pending work.
     *
     * @returns True when initialization, route/ref updates, memo recomputation,
     * or consumer binding work is queued.
     */
    protected precheck() {
        const dirty =
            modelResolver.check() ||
            routeResolver.check() ||
            memoResolver.check() ||
            refResolver.check() ||
            decorConsumerResolver.check() ||
            eventConsumerResolver.check() ||
            frameConsumerResolver.check()
        return dirty;
    }

    /**
     * Wrap construction so initial model binding runs inside one blink.
     *
     * This is used by `useModel()` so a constructor can create
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
                    that.launch(() => that.resolve());
                }
            }
        }[ModelCtor.name] as any
    }

    /**
     * Resolve one round of blink-scoped queues in dependency order.
     *
     * Initialize models, update routes and memos, then validate refs before
     * refreshing consumer bindings. Decor producers settle in the action phase.
     *
     * @returns Nothing.
     */
    private resolve() {
        /** Associate value changes before listeners refresh their bindings. */
        modelResolver.resolve();
        routeResolver.resolve();
        memoResolver.resolve();
        refResolver.resolve();
        /** Refresh listeners after this round's memo and ref updates. */
        decorConsumerResolver.resolve();
        eventConsumerResolver.resolve();
        frameConsumerResolver.resolve();
    }
}

export const blinkManager = new BlinkManager();
