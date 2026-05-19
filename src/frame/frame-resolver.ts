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

    public async resolve() {
        this._pending = true;
        const step = this._step;
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
        this._pending = false;
    }
}

export const frameResolver = new FrameResolver();
