import { Model } from "../model";
import { Constructor } from "../types";
import { storeRegistry } from "./store-registry";

export function useStore(code: string) {
    return function(proto: Model) {
        const constructor = proto.constructor as Constructor<Model>;
        storeRegistry.register(code, constructor);
    }
}
