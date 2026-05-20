import { View } from ".";
import { Constructor } from "../types";

export function useView<T extends View>() {
    return function(Constructor: Constructor<View>): Constructor<T> {
        const ConstructorMap: Record<string, any> = {
            [Constructor.name]: class extends Constructor {
                constructor(...params: any[]) {
                    super(...params);
                    this._internal.init();
                }
            }
        };
        return ConstructorMap[Constructor.name];
    }
}
