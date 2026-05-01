import { Model } from "../model";
import { useAction } from "../action/use-action";
import { weakRefRegistry } from "./weak-ref-registry";
import { weakRefManager } from "./weak-ref-manager";
import { Tag } from "../tag/tag-registry";

class WeakRefResolver {
    private _context: Set<Tag | Model> = new Set();

    public register(dep: Tag): void;
    public register(model: Model): void;
    
    @useAction()
    public register(arg: Tag | Model) {
        if (arg instanceof Model) {
            arg.descendants.forEach(descendant => this._context.add(descendant));
            this._context.add(arg);
        } 
        else this._context.add(arg);
    }

    public resolve() {
        const weakRefTags = [...this._context];
        this._context.clear();
        weakRefTags.forEach(value => {
            if (value instanceof Model) {
                const refSource = value;
                const refUnbinderMap = weakRefRegistry.query(refSource);
                refUnbinderMap.forEach((refUnbinder, key) => {
                    const refTarget = Reflect.get(refSource, key);
                    refUnbinder(refSource, key, refTarget);
                });
                // As refTarget
                const refTarget = value;
                const refSourcesMap = weakRefManager.query(refTarget);
                refSourcesMap.forEach((refSources, key) => {
                    refSources.forEach(refSource => {
                        const refUnbinderMap = weakRefRegistry.query(refSource);
                        const refUnbinder = refUnbinderMap.get(key);
                        if (!refUnbinder) return;
                        refUnbinder(refSource, key, refTarget);
                    });
                });
            } else {
                const refSource = value.target;
                const refKey = value.key;
                const refTarget = Reflect.get(refSource, refKey);
                const refUnbinderMap = weakRefRegistry.query(refSource);
                const refUnbinder = refUnbinderMap.get(refKey);
                if (!refUnbinder) return;
                refUnbinder(refSource, refKey, refTarget);
            }
        });
    }
}

export const weakRefResolver = new WeakRefResolver();
