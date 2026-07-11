import { Frame } from ".";
import { Tag } from "../tag/tag-registry";

type FrameContext = {
    consumerTag: Tag;
    frame: Frame;
}

class FrameResolver {
    protected _step: number;
    protected _pending: boolean;
    protected _queue: Map<number, FrameContext[]>

    /**
     * Initialize the frame queue used by one anime boundary.
     *
     * The resolver starts at step 1 so frames emitted before any manual
     * `proceed()` call are delivered in the first batch.
     */
    constructor() {
        this._step = 1;
        this._pending = false;
        this._queue = new Map()
    }

    /**
     * Advance the frame step for subsequently registered frames.
     *
     * Consumers can use this to split frame handling into ordered batches.
     * `resolve()` waits for all handlers in a step before moving to the next.
     *
     * @returns Nothing.
     */
    public proceed() {
        this._step += 1;
    }

    /**
     * Queue a frame for the current step and consumer method.
     *
     * This is called by `frameService.emit()` after it finds all consumers
     * currently bound to the producer model and frame type.
     *
     * @param consumerTag - Tag pointing to the consumer model and method key.
     * @param frame - Frame instance that should be passed to the consumer.
     * @returns Nothing.
     */
    public register(consumerTag: Tag, frame: Frame) {
        const step = this._step;
        const frames = this._queue.get(step) ?? [];
        frames.push({ consumerTag, frame });
        this._queue.set(step, frames);
    }

    /**
     * Run an anime boundary and flush queued frames after it completes.
     *
     * Nested anime calls reuse the outer boundary, so frame resolution happens
     * once at the end of the outermost call. Promise results are awaited before
     * the queue is resolved.
     *
     * @param handler - User or framework operation that may emit frames.
     * @returns The handler result, preserving promise results when present.
     */
    public async launch(handler: () => unknown) {
        if (this._pending) return handler();
        this._pending = true;
        const value = handler();
        if (value instanceof Promise) {
            return value.then((result) => {
                this._pending = false;
                this.resolve();
                return result;
            })
        } else {
            this._pending = false;
            this.resolve();
            return value;
        }
    }

    /**
     * Drain queued frames in step order.
     *
     * For each step, all consumer handlers are invoked concurrently and awaited
     * before the next step starts. This is the final dispatch stage for frames.
     *
     * @returns A promise that resolves after all queued frame handlers finish.
     */
    public async resolve() {
        const step = this._step;
        this._step = 1;
        const queue = this._queue;
        this._queue = new Map();
        let current = 0;
        while (current <= step) {
            current += 1;
            const frames = queue.get(current);
            if (!frames?.length) continue;
            await Promise.all(frames.map(({ consumerTag, frame }) => {
                const model = consumerTag.target;
                const key = consumerTag.key;
                const handler = Reflect.get(model, key);
                if (!(handler instanceof Function)) return;
                return handler.call(model, frame);
            }));
        }
    }
}

export const frameResolver = new FrameResolver();
