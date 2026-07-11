import { blinkManager } from "./action/blink-manager";
import { Model } from "./model";
import { modelResolver } from "./model-resolver";
import { Constructor } from "./types";

export function useView<T extends Model>() {
    return function(Constructor: Constructor<Model>): Constructor<T> {
        Constructor = blinkManager.delegate(Constructor);
        return {
            [Constructor.name]: class extends Constructor {
                constructor(...params: any[]) {
                    super(...params);
                    modelResolver.register(this);
                }
            } 
        }[Constructor.name] as any
    }
}
