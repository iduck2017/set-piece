import { trxManager } from "../trx/trx-manager";
import { Field } from "../utils/field-registry";
import { weakRefRegistry } from "./weak-ref-registry";

class WeakRefFieldResolver {
    private _context: Set<Field> = new Set();

    public register(refField: Field) {
        trxManager.run(() => {
            this._context.add(refField);
        });
    }

    public resolve() {
        this._context.forEach(refField => {
            const [refSource, key] = refField;
            const refTarget = Reflect.get(refSource, key);
            const refUnbinderMap = weakRefRegistry.query(refSource);
            const refUnbinder = refUnbinderMap.get(key);
            if (!refUnbinder) return;
            refUnbinder(refSource, key, refTarget);
        });
        this._context.clear();
    }
}

export const weakRefFieldResolver = new WeakRefFieldResolver();
