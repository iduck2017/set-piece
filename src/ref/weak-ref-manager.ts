import { Model } from "../model";

type WeakRefSourcesMap = Map<string, Model[]>;
class WeakRefSourceManager {
    private _context: WeakMap<Model, WeakRefSourcesMap> = new WeakMap();

    public query(refTarget: Model): WeakRefSourcesMap {
        return this._context.get(refTarget) ?? new Map();
    }

    public bind(
        refSource: Model, 
        key: string, 
        refTargets: Model[]
    ) {
        refTargets.forEach(target => {
            const refSourcesMap: WeakRefSourcesMap = this._context.get(target) ?? new Map();
            const refSources: Model[] = refSourcesMap.get(key) ?? [];
            refSources.push(refSource);
            refSourcesMap.set(key, refSources);
            this._context.set(target, refSourcesMap);
        });
    }

    public unbind(
        refSource: Model, 
        key: string, 
        refTargets: Model[]
    ) {
        refTargets.forEach(target => {
            const refSourcesMap: WeakRefSourcesMap = this._context.get(target) ?? new Map();
            const refSources: Model[] = refSourcesMap.get(key) ?? [];
            const index = refSources.indexOf(refSource);
            if (index === -1) return;
            refSources.splice(index, 1);
            refSourcesMap.set(key, refSources);
            this._context.set(target, refSourcesMap);
        });
    }
}
export const weakRefManager = new WeakRefSourceManager();

