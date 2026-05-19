import { Constructor } from "../types";
import { View } from "../view";
import { viewRootRegistry } from "./view-root-registry";

export function useViewRoot() {
    return function<V extends Constructor<View>>(constructor: V): V {
        viewRootRegistry.register(constructor);
        return constructor;
    }
}
