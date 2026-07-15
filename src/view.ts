import { blinkManager } from "./utils/blink-manager";
import { Model } from "./model";
import { modelResolver } from "./utils/model-resolver";
import { Constructor } from "./types";

export function useView<T extends Model>() {
    return function(ViewCtor: Constructor<Model>): Constructor<T> {
        const Wrapped = blinkManager.delegate(ViewCtor);
        return {
            [Wrapped.name]: class extends Wrapped {
                constructor(...params: any[]) {
                    super(...params);
                    modelResolver.register(this);
                }
            } 
        }[Wrapped.name] as any
    }
}
