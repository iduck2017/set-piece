import { Model } from "./model";
import { Constructor } from "./types";
import { storeRegistry } from "./store/store-registry";
import { microActionManager } from "./action/micro-action-manager";

export function useModel<T extends Model>(code: string) {
    return function(Constructor: Constructor<Model>): Constructor<T> {
        storeRegistry.register(code, Constructor);
        Constructor = microActionManager.delegate(Constructor);
        return class extends Constructor {
            constructor(...params: any[]) {
                super(...params);
                this._internal.init();
            }
        } as any
    }
}
