import { Frame } from ".";
import { Tag } from "../tag/tag-registry";
import { Method } from "../types";

type FrameContext = {
    consumerTag: Tag;
    frame: Frame;
}

class FrameResolver {
    protected _step: number;
    protected _pending: boolean;
    protected _context: Map<number, FrameContext[]>

    constructor() {
        this._step = 1;
        this._pending = false;
        this._context = new Map()
    }

    public proceed() {
        this._step += 1;
    }

    public register(consumerTag: Tag, frame: Frame) {
        const step = this._step;
        const context = this._context.get(step) ?? [];
        context.push({ consumerTag, frame });
        this._context.set(step, context);
    }

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

    public async resolve() {
        const step = this._step;
        this._step = 1;
        const context = this._context;
        this._context = new Map();
        let current = 0;
        while (current <= step) {
            current += 1;
            const frames = context.get(current);
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

export function useAnime() {
    return function(
        _prototype: unknown,
        _key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: unknown[]) {
            const _handler = handler.bind(this, ...args);
            return frameResolver.launch(_handler);
        }
        return descriptor;
    }
}
