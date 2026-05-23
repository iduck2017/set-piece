import { Model } from "./model";
import { Constructor } from "./types";
import { storeRegistry } from "./store/store-registry";
import { microActionManager } from "./action/micro-action-manager";

export function useModel<T extends Model>(code: string) {
    return function(Constructor: Constructor<Model, undefined[]>): Constructor<T> {
        storeRegistry.register(code, Constructor);
        Constructor = microActionManager.delegate(Constructor);
        const HOCConstructor: any = class extends Constructor {
            constructor(...params: any[]) {
                super(...params);
                this._internal.init();
            }
        } 
        return HOCConstructor
    }
}
