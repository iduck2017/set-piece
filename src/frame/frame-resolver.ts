import { Method } from "../types";

class FrameResolver {
    protected _step: number;

    protected _pending: boolean;

    protected _context: Map<number, Array<Method<Promise<void>>>>

    constructor() {
        this._step = 1;
        this._pending = false;
        this._context = new Map()
    }

    public proceed() {
        this._step += 1;
    }

    public register(handler: () => Promise<void>) {
        const step = this._step;
        const handlers = this._context.get(step) ?? [];
        handlers.push(handler);
        this._context.set(step, handlers);
    }

    public async launch(handler: () => unknown) {
        if (this._pending) return handler();
        this._pending = true;
        const result = handler();
        this._pending = false;
        await this.resolve();
        return result;
    }

    public async resolve() {
        const step = this._step;
        console.log('resolve', step)
        this._step = 1;
        const context = this._context;
        this._context = new Map();
        let current = 0;
        while (current <= step) {
            current += 1;
            const handlers = context.get(current);
            if (!handlers?.length) continue;
            await Promise.all(handlers.map((handler) => {
                return handler()
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