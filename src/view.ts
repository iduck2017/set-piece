import { microActionManager } from "./action/micro-action-manager";
import { Model } from "./model";
import { Constructor } from "./types";

export function useView<T extends Model>() {
    return function(Constructor: Constructor<Model>): Constructor<T> {
        Constructor = microActionManager.delegate(Constructor);
        return {
            [Constructor.name]: class extends Constructor {
                constructor(...params: any[]) {
                    super(...params);
                    this._internal.init();
                }
            } 
        }[Constructor.name] as any
    }
}