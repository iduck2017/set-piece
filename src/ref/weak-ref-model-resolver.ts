import { trxManager } from "../trx/trx-manager";
import { Model } from "../model";
import { weakRefRegistry } from "./weak-ref-registry";
import { weakRefSourceManager } from "./weak-ref-source-manager";

class WeakRefModelResolver {
    private _context: Set<Model> = new Set();

    public register(refSource: Model) {
        trxManager.run(() => {
            refSource.descendants.forEach(descendant => {
                this._context.add(descendant);
            });
            this._context.add(refSource);
        });
    }

    public resolve() {
        this._context.forEach(model => {
            // As refSource
            const refSource = model;
            const refUnbinderMap = weakRefRegistry.query(refSource);
            refUnbinderMap.forEach((refUnbinder, key) => {
                const refTarget = Reflect.get(refSource, key);
                refUnbinder(refSource, key, refTarget);
            });
            // As refTarget
            const refTarget = model;
            const refSourceMap = weakRefSourceManager.query(refTarget);
            refSourceMap.forEach((refSources, key) => {
                refSources.forEach(refSource => {
                    const refUnbinderMap = weakRefRegistry.query(refSource);
                    const refUnbinder = refUnbinderMap.get(key);
                    if (!refUnbinder) return;
                    refUnbinder(refSource, key, refTarget);
                });
            });
        });
        this._context.clear();
    }
}

export const weakRefModelResolver = new WeakRefModelResolver();
