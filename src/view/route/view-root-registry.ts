import { View } from "..";
import { AbstractConstructor } from "../../types";

class ViewRootRegistry {
    private _config: WeakSet<Function> = new WeakSet();

    public register(constructor: AbstractConstructor<View>) {
        this._config.add(constructor);
    }

    public check(view: View): boolean {
        let constructor: any = view.constructor;
        while (constructor) {
            if (this._config.has(constructor)) return true;
            constructor = Object.getPrototypeOf(constructor);
        }
        return false;
    }
}

export const viewRootRegistry = new ViewRootRegistry();
