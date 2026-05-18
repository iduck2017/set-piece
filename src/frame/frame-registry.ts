import { Frame } from ".";
import { Model } from "../model";
import { Method } from "../types";

class FrameRegistry {
    protected _context: WeakMap<Model, Array<Method<Promise<void>, [Frame]>>> = new WeakMap();

    public register(
        model: Model,
        handler: Method<Promise<void>, [Frame]>,
    ) {
        let handlers = this._context.get(model) ?? [];
        handlers.push(handler);
        this._context.set(model, handlers);
        return this.unregister.bind(this, model, handler)
    }

    public unregister(
        model: Model,
        handler: Method<Promise<void>, [Frame]>,
    ) {
        const handlers = this._context.get(model);
        if (!handlers) return;
        const index = handlers.indexOf(handler);
        if (index === -1) return;
        handlers.splice(index, 1);
    }

    public query(model: Model) {
        return this._context.get(model) ?? [];
    }
}

export const frameRegistry = new FrameRegistry()