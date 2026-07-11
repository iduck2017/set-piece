import { useBlink } from "./action/blink-manager";
import type { Model } from "./model";

class ModelResolver {
    private readonly _context: Set<Model> = new Set();

    @useBlink()
    public register(model: Model) {
        this._context.add(model);
    }

    public check() {
        return Boolean(this._context.size);
    }

    public resolve() {
        const models = [...this._context];
        this._context.clear();
        models.forEach(model => {
            model._internal.init();
        });
    }
}

export const modelResolver = new ModelResolver();
